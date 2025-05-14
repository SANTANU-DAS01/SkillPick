"use client"

import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import api from "../../utils/api"
import AuthContext from "../../context/AuthContext"
import { Upload } from "lucide-react"

const AddBook = () => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    subject: "",
    tags: "",
    semester: "", // Added semester field
    stream: "All", // Added stream field with default
  })

  const [coverImage, setCoverImage] = useState(null)
  const [coverImagePreview, setCoverImagePreview] = useState(null)
  const [bookFile, setBookFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { title, author, description, tags, semester, stream } = formData

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleCoverImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0]
      setCoverImage(file)

      // Create blob URL for preview only, not for upload
      const blobUrl = URL.createObjectURL(file)
      setCoverImagePreview(blobUrl)
    }
  }

  const handleBookFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0]
      setBookFile(file)
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!title) newErrors.title = "Title is required"
    if (!author) newErrors.author = "Author is required"
    if (!description) newErrors.description = "Description is required"
    if (!formData.subject) newErrors.subject = "Subject is required"
    if (!semester) newErrors.semester = "Semester is required"
    if (!stream) newErrors.stream = "Stream is required"
    if (!bookFile) newErrors.bookFile = "Book file is required"
    if (!coverImage) newErrors.coverImage = "Cover image is required"

    // Validate file types to match multer's fileFilter
    if (bookFile) {
      const bookExt = bookFile.name.split('.').pop().toLowerCase();
      const validExtensions = ['pdf', 'doc', 'docx'];
      if (!validExtensions.includes(bookExt)) {
        newErrors.bookFile = "Only PDF, DOC, or DOCX files are allowed";
      }
    }

    if (coverImage) {
      const imgExt = coverImage.name.split('.').pop().toLowerCase();
      const validExtensions = ['jpeg', 'jpg', 'png', 'gif'];
      if (!validExtensions.includes(imgExt)) {
        newErrors.coverImage = "Only JPEG, JPG, PNG, or GIF files are allowed";
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      // Generate a temporary ObjectId-like string for relatedId
      // MongoDB ObjectId is a 24-character hex string
      const generateTempId = () => {
        return Array(24).fill(0).map(() => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
      };

      const tempBookId = generateTempId();

      // 1. Upload book file with the temp ID
      const bookFileForm = new FormData();
      bookFileForm.append("file", bookFile);
      bookFileForm.append("relatedModel", "Book");
      bookFileForm.append("relatedId", tempBookId);
      bookFileForm.append("type", "book");

      const bookFileUpload = await api.post("/api/files/upload", bookFileForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const bookFileData = bookFileUpload.data.data;

      // 2. Upload cover image with the temp ID
      let coverImageData = null;
      if (coverImage) {
        const coverForm = new FormData();
        coverForm.append("file", coverImage);
        coverForm.append("relatedModel", "Book");
        coverForm.append("relatedId", tempBookId);
        coverForm.append("type", "cover_image");

        const coverUpload = await api.post("/api/files/upload", coverForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        coverImageData = coverUpload.data.data;
      }

      // 3. Create book with uploaded file & image info
      const bookData = {
        ...formData,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        fileUrl: bookFileData.fileUrl,
        fileId: bookFileData.fileId,
        coverImage: coverImageData.fileUrl,
        createdBy: user.id,
        semester: parseInt(semester, 10),
      };

      // Create the book
      const res = await api.post("/api/books", bookData);
      const newBookId = res.data.data._id;

      // 4. Update file records with the actual book ID
      await api.put(`/api/files/${bookFileData._id}`, {
        relatedTo: {
          model: "Book",
          id: newBookId
        }
      });

      await api.put(`/api/files/${coverImageData._id}`, {
        relatedTo: {
          model: "Book",
          id: newBookId
        }
      });

      // Clean up preview URL
      if (coverImagePreview) {
        URL.revokeObjectURL(coverImagePreview);
      }

      toast.success("Book added successfully!");
      navigate("/admin/books");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add book");
      console.error("Error adding book:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Book</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={onChange}
              className={`block w-full px-3 py-2 border ${errors.title ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Author *
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={author}
              onChange={onChange}
              className={`block w-full px-3 py-2 border ${errors.author ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.author && <p className="mt-1 text-sm text-red-600">{errors.author}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={description}
              onChange={onChange}
              className={`block w-full px-3 py-2 border ${errors.description ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject *
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={onChange}
              className={`block w-full px-3 py-2 border ${errors.subject ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            >
              <option value="">Select Subject</option>
              <option value="Applied Physics">Applied Physics</option>
              <option value="Applied Chemistry">Applied Chemistry</option>
              <option value="Mathematics-I">Mathematics-I</option>
              <option value="Communication skills in English">Communication skills in English</option>
              <option value="Principles of Management">Principles of Management</option>
              <option value="Stenography">Stenography</option>
              <option value="Business Mathematics">Business Mathematics</option>
              <option value="Behavioural Principles">Behavioural Principles</option>
              <option value="Introduction to Hospitality Management">Introduction to Hospitality Management</option>
              <option value="Travel & Tourism Industry">Travel & Tourism Industry</option>
              <option value="Basic Computer Fundamentals">Basic Computer Fundamentals</option>
              <option value="Principles of Marketing-I">Principles of Marketing-I</option>
              <option value="Applied Physics-II">Applied Physics-II</option>
              <option value="FEEE">FEEE</option>
              <option value="Mathematics-II">Mathematics-II</option>
              <option value="Introduction to IT Systems">Introduction to IT Systems</option>
              <option value="Engineering Mechanics">Engineering Mechanics</option>
              <option value="Basic Photography I">Basic Photography I</option>
              <option value="Basic Photography II">Basic Photography II</option>
              <option value="Basic Engineering for Printing">Basic Engineering for Printing</option>
              <option value="Material Science for Printing">Material Science for Printing</option>
              <option value="Architectural Drawing-II">Architectural Drawing-II</option>
              <option value="Architectural Basic Design">Architectural Basic Design</option>
              <option value="Basic Engineering for Footwear Manufacture">Basic Engineering for Footwear Manufacture</option>
              <option value="Principles of Footwear Manufacture">Principles of Footwear Manufacture</option>
              <option value="Elements of Footwear Designing & Pattern Cutting">Elements of Footwear Designing & Pattern Cutting</option>
              <option value="Footwear Manufacturing Techniques-I">Footwear Manufacturing Techniques-I</option>
              <option value="Footwear Material Study-I">Footwear Material Study-I</option>
              <option value="Footwear Auxillary Materials">Footwear Auxillary Materials</option>
              <option value="Scripting Languages">Scripting Languages</option>
              <option value="Computer Programming in C">Computer Programming in C</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Computer System Organisation">Computer System Organisation</option>
              <option value="Algorithms">Algorithms</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Introduction to DBMS">Introduction to DBMS</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="OOP using Java">OOP using Java</option>
              <option value="Microprocessor & Microcontroller">Microprocessor & Microcontroller</option>
              <option value="IOT">IOT</option>
              <option value="Theory of Automata">Theory of Automata</option>
              <option value="Advanced Computer Network">Advanced Computer Network</option>
              <option value="Computer Graphics">Computer Graphics</option>
              <option value="Enterpreneurship & Start-ups">Enterpreneurship & Start-ups</option>
              <option value="Engineering Economics & Project Management">Engineering Economics & Project Management</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Data Science-Data Warehousing & Data Mining">Data Science-Data Warehousing & Data Mining</option>
              <option value="Mechanical Engineering Drawing">Mechanical Engineering Drawing</option>
              <option value="Mechanical Engineering Materials">Mechanical Engineering Materials</option>
              <option value="Strength of Materials">Strength of Materials</option>
              <option value="Manufacturing Processes-I">Manufacturing Processes-I</option>
              <option value="Thermal Engineering-I">Thermal Engineering-I</option>
              <option value="Theory of Machine">Theory of Machine</option>
              <option value="Manufacturing Process-II">Manufacturing Process-II</option>
              <option value="Thermal Engineering-II">Thermal Engineering-II</option>
              <option value="Engineering Metrology">Engineering Metrology</option>
              <option value="Refrigeration & Air Conditioning">Refrigeration & Air Conditioning</option>
              <option value="Power Engineering">Power Engineering</option>
              <option value="Advanced Manufacturing Processes">Advanced Manufacturing Processes</option>
              <option value="Fluid Mechanics & Machinery">Fluid Mechanics & Machinery</option>
              <option value="Power Plant Engineering">Power Plant Engineering</option>
              <option value="Automobile Engineering">Automobile Engineering</option>
              <option value="Design of Machine Elements">Design of Machine Elements</option>
              <option value="Mechatronics">Mechatronics</option>
              <option value="Work,Organisation & Management">Work,Organisation & Management</option>
              <option value="Construction Materials">Construction Materials</option>
              <option value="Basic Surveying">Basic Surveying</option>
              <option value="Mechanics of Materials">Mechanics of Materials</option>
              <option value="Building Construction">Building Construction</option>
              <option value="Concrete Technology">Concrete Technology</option>
              <option value="Civil Engineering Planning & Drawing">Civil Engineering Planning & Drawing</option>
              <option value="Transportion Engineering">Transportion Engineering</option>
              <option value="Hydraulics">Hydraulics</option>
              <option value="Advanced Surveying">Advanced Surveying</option>
              <option value="Theory of Structure">Theory of Structure</option>
              <option value="Geotechnical Engineering">Geotechnical Engineering</option>
              <option value="Design of RCC and Steel Structure">Design of RCC and Steel Structure</option>
              <option value="Rural Construction Technology">Rural Construction Technology</option>
              <option value="Water Resource Engineering">Water Resource Engineering</option>
              <option value="Estimating,Costing and Valuation">Estimating,Costing and Valuation</option>
              <option value="Software Engineering & Management in the Construction Sector">Software Engineering & Management in the Construction Sector</option>
              <option value="Traffic Engineering">Traffic Engineering</option>
              <option value="Building Services and Maintenance">Building Services and Maintenance</option>
              <option value="Public Health Engineering">Public Health Engineering</option>
              <option value="Advanced Construction Technology">Advanced Construction Technology</option>
              <option value="Surveying-I">Surveying-I</option>
              <option value="Surveying-II">Surveying-II</option>
              <option value="Building Construction Practices">Building Construction Practices</option>
              <option value="Cadastral Survey and Land Laws">Cadastral Survey and Land Laws</option>
              <option value="Mechanics of Material">Mechanics of Material</option>
              <option value="Concrete Technology">Concrete Technology</option>
              <option value="Mine Surveying">Mine Surveying</option>
              <option value="Geodesy and Astronomy">Geodesy and Astronomy</option>
              <option value="Surveying III">Surveying III</option>
              <option value="Photogrammetry and Remote Sensing">Photogrammetry and Remote Sensing</option>
              <option value="Triangulation & Trilateration">Triangulation & Trilateration</option>
              <option value="Estimating, Costing, Specification and Valuation">Estimating, Costing, Specification and Valuation</option>
              <option value="Design of R.C.C. Structure">Design of R.C.C. Structure</option>
              <option value="Railway & Tunnel Survey">Railway & Tunnel Survey</option>
              <option value=" Advanced Survey"> Advanced Survey</option>
              <option value="Route Survey">Route Survey</option>
              <option value="Water Resource Engineering">Water Resource Engineering</option>
              <option value="Construction Engineering">Construction Engineering</option>
              <option value="Transmission Line Survey">Transmission Line Survey</option>
              <option value="Building Planning and Drawing">Building Planning and Drawing</option>
              <option value="Discrete Structures">Discrete Structures</option>
              <option value="Data Communication and Networking">Data Communication and Networking</option>
              <option value="Introduction to Cyber Security">Introduction to Cyber Security</option>
              <option value="Cyber Security Laws">Cyber Security Laws</option>
              <option value="Web Designing and Multimedia Technology">Web Designing and Multimedia Technology</option>
              <option value="CyberCrime Investigation and Cyber Forensics">CyberCrime Investigation and Cyber Forensics</option>
              <option value="Introduction to cryptography">Introduction to cryptography</option>
              <option value="Intrusion Detection and Penetration Testing">Intrusion Detection and Penetration Testing</option>
              <option value="Mobile Phone Security">Mobile Phone Security</option>
              <option value="Cyber Security Vulnerabilities & Safeguards">Cyber Security Vulnerabilities & Safeguards</option>
              <option value="Basics of Security Operations and Threat Modeling">Basics of Security Operations and Threat Modeling</option>
              <option value="Network Security Management">Network Security Management</option>
              <option value="Introduction to Electric Generation Systems">Introduction to Electric Generation Systems</option>
              <option value="Electrical Circuits">Electrical Circuits</option>
              <option value="Electrical and Electronic Measurement">Electrical and Electronic Measurement</option>
              <option value="DC Machines and Transformers">DC Machines and Transformers</option>
              <option value="Analog and Digital Circuits">Analog and Digital Circuits</option>
              <option value="Power Electronics Converters and Application">Power Electronics Converters and Application</option>
              <option value="Electric Power Transmission and Distribution">Electric Power Transmission and Distribution</option>
              <option value="Induction,Synchronus and Special Electrical Machines">Induction,Synchronus and Special Electrical Machines</option>
              <option value="Renewable Energy Power Plants">Renewable Energy Power Plants</option>
              <option value="Switchgear and Protection">Switchgear and Protection</option>
              <option value="Microcontroller and its applications">Microcontroller and its applications</option>
              <option value="Building Electrification">Building Electrification</option>
              <option value="Industrial Automation & Control">Industrial Automation & Control</option>
              <option value="Solar Power Technologies">Solar Power Technologies</option>
              <option value="Energy Convertion and Audit">Energy Convertion and Audit</option>
              <option value="Industrial Instrumentation & Condition Monitoring">Industrial Instrumentation & Condition Monitoring</option>
              <option value="Computer Programming Language">Computer Programming Language</option>
              <option value="Electronic Devices and Circuits">Electronic Devices and Circuits</option>
              <option value="Digital Electronics">Digital Electronics</option>
              <option value="Electric Circuits and Network">Electric Circuits and Network</option>
              <option value="Principles of Electronic Communication">Principles of Electronic Communication</option>
              <option value="Consumer Electronics">Consumer Electronics</option>
              <option value="Linear Integrated Circuits">Linear Integrated Circuits</option>
              <option value="Electronic Measurements and Instrumentation">Electronic Measurements and Instrumentation</option>
              <option value="Digital and Microwave Communication Systems">Digital and Microwave Communication Systems</option>
              <option value="Embedded Systems">Embedded Systems</option>
              <option value="Advanced Communication System">Advanced Communication System</option>
              <option value="Industrial Electronics">Industrial Electronics</option>
              <option value="Industrial Automation">Industrial Automation</option>
              <option value="Computer Networking and Data Communication">Computer Networking and Data Communication</option>
              <option value="Construction Methods and Equipment Management">Construction Methods and Equipment Management</option>
              <option value="Advanced Surveying">Advanced Surveying</option>
              <option value="Theory of Structure and Mechanism">Theory of Structure and Mechanism</option>
              <option value="Geotechnical Engineering">Geotechnical Engineering</option>
              <option value="Design of RCC Structure">Design of RCC Structure</option>
              <option value="Precast & Prestressed Concrete">Precast & Prestressed Concrete</option>
              <option value="Safety in Construction">Safety in Construction</option>
              <option value="Electrical Machine & Measurement">Electrical Machine & Measurement</option>
              <option value="Circuit Theory">Circuit Theory</option>
              <option value="Fundamentals of Instrumentation">Fundamentals of Instrumentation</option>
              <option value="Electronics Instruments and Measurement">Electronics Instruments and Measurement</option>
              <option value="Process Instrumentation">Process Instrumentation</option>
              <option value="Industrial Electronics I">Industrial Electronics I</option>
              <option value="Process Control-I">Process Control-I</option>
              <option value="Optical Instrumentation">Optical Instrumentation</option>
              <option value="Process Instrumentation II">Process Instrumentation II</option>
              <option value="Process Control-II">Process Control-II</option>
              <option value="Analytical Instrumentation">Analytical Instrumentation</option>
              <option value="Biomedical Instrumentation">Biomedical Instrumentation</option>
              <option value="Electronic Communication Principle">Electronic Communication Principle</option>
              <option value="Industrial Buses and Networks">Industrial Buses and Networks</option>
              <option value="Electrical Machine and Measurement">Electrical Machine and Measurement</option>
              <option value="Fundamentals of Electrical Circuit and Network">Fundamentals of Electrical Circuit and Network</option>
              <option value="Basic Instrumentation & Control">Basic Instrumentation & Control</option>
              <option value="Industrial Instrumentation-I">Industrial Instrumentation-I</option>
              <option value="Applied Electronics & Electric Measuring Instruments">Applied Electronics & Electric Measuring Instruments</option>
              <option value="Biomedical Instrumentation">Biomedical Instrumentation</option>
              <option value="Industrial Instrumentation-II">Industrial Instrumentation-II</option>
              <option value="Advanced Process Control">Advanced Process Control</option>
              <option value="Analytical & Optical Instrumentation">Analytical & Optical Instrumentation</option>
              <option value="History of Art and Fashion">History of Art and Fashion</option>
              <option value="Designing Principles and Development">Designing Principles and Development</option>
              <option value="Fashion Studies for Leather Goods">Fashion Studies for Leather Goods</option>
              <option value="Fundamental of Leather Goods Manufacturing">Fundamental of Leather Goods Manufacturing</option>
              <option value="Essential Management Studies for Leather Goods Industry">Essential Management Studies for Leather Goods Industry</option>
              <option value="Designing Problems & Solutions">Designing Problems & Solutions</option>
              <option value="Production Planning & Quality Assurance">Production Planning & Quality Assurance</option>
              <option value="Leather Goods Costing">Leather Goods Costing</option>
              <option value="Leather Goods Construction Technique">Leather Goods Construction Technique</option>
              <option value="Leather Goods Marketing & Merchadsing">Leather Goods Marketing & Merchadsing</option>
              <option value="Fundamental of Footwear Technology">Fundamental of Footwear Technology</option>
              <option value="Leather Goods Machinery">Leather Goods Machinery</option>
              <option value="Material Science for Leather Goods-II">Material Science for Leather Goods-II</option>
              <option value="Leather Goods Packaging and Labelling">Leather Goods Packaging and Labelling</option>
              <option value="Basic Garment Design">Basic Garment Design</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="Fundamentals of Safety Leather Gloves">Fundamentals of Safety Leather Gloves</option>
              <option value="Basics of Garment Construction">Basics of Garment Construction</option>
              <option value="Industrial Management and Safety">Industrial Management and Safety</option>
              <option value="Spatial Statistics-I">Spatial Statistics-I</option>
              <option value="Cartography in GIS">Cartography in GIS</option>
              <option value="Basic Concept of Navigation">Basic Concept of Navigation</option>
              <option value="Problem Solving and Coding">Problem Solving and Coding</option>
              <option value="Applied Surveying">Applied Surveying</option>
              <option value="Spatial Statistics-II">Spatial Statistics-II</option>
              <option value="Advance Surveying">Advance Surveying</option>
              <option value="Digital Image Processing">Digital Image Processing</option>
              <option value="Geographic Information System">Geographic Information System</option>
              <option value="Database Management System Post GIS">Database Management System Post GIS</option>
              <option value="Remote Sensing">Remote Sensing</option>
              <option value="Geo-Informatics">Geo-Informatics</option>
              <option value="Application of GIS in Urban Planning">Application of GIS in Urban Planning</option>
              <option value="AI">AI</option>
              <option value="Application of GIS and Planning">Application of GIS and Planning</option>
              <option value="Application of GIS in Diaster Management">Application of GIS in Diaster Management</option>
              <option value="Power Electronics Converters and Applications">Power Electronics Converters and Applications</option>
              <option value="Electric Power Transmission and Distribution">Electric Power Transmission and Distribution</option>
              <option value="Induction,Synchronus and Special Electrical Machines">Induction,Synchronus and Special Electrical Machines</option>
              <option value="Industrial Instrumentation & Control System">Industrial Instrumentation & Control System</option>
              <option value="Switchgear and Prediction">Switchgear and Prediction</option>
              <option value="Principles of Electronics Communication">Principles of Electronics Communication</option>
              <option value="Illumination Practices">Illumination Practices</option>
            </select>
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
          </div>

          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
              Semester *
            </label>
            <select
              id="semester"
              name="semester"
              value={semester}
              onChange={onChange}
              className={`block w-full px-3 py-2 border ${errors.semester ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
            </select>
            {errors.semester && <p className="mt-1 text-sm text-red-600">{errors.semester}</p>}
          </div>

          <div>
            <label htmlFor="stream" className="block text-sm font-medium text-gray-700 mb-1">
              Stream *
            </label>
            <select
              id="stream"
              name="stream"
              value={stream}
              onChange={onChange}
              className={`block w-full px-3 py-2 border ${errors.stream ? "border-red-300" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            >
              <option value="All">All</option>
              <option value="PHO">PHO</option>
              <option value="DP">DP</option>
              <option value="ARCH">ARCH</option>
              <option value="FWT">FWT</option>
              <option value="CST">CST</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
              <option value="SE">SE</option>
              <option value="CFS">CFS</option>
              <option value="EE">EE</option>
              <option value="ETCE">ETCE</option>
              <option value="CAU">CAU</option>
              <option value="CSE">CSE</option>
              <option value="CSWT">CSWT</option>
              <option value="IT">IT</option>
              <option value="ETE">ETE</option>
              <option value="ICE">ICE</option>
              <option value="ECE">ECE</option>
              <option value="LGT">LGT</option>
              <option value="MEP">MEP</option>
              <option value="GIS & GPS">GIS & GPS</option>
              <option value="EEIC">EEIC</option>
              <option value="EEPS">EEPS</option>
              <option value="EEE">EEE</option>
              <option value="MOPM">MOPM</option>
              <option value="TT">TT</option>
            </select>
            {errors.stream && <p className="mt-1 text-sm text-red-600">{errors.stream}</p>}
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={tags}
              onChange={onChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. programming, semester1, java"
            />
          </div>
          <div>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image *
            </label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${errors.coverImage ? "border-red-300" : "border-gray-300"} border-dashed rounded-md`}>
              <div className="space-y-1 text-center">
                {coverImagePreview ? (
                  <div className="mx-auto">
                    <img 
                      src={coverImagePreview} 
                      alt="Cover preview" 
                      className="h-32 w-auto object-contain mx-auto"
                    />
                  </div>
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="coverImage"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="coverImage"
                      name="coverImage"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/jpg"
                      onChange={handleCoverImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                {coverImage && <p className="text-xs text-green-500">{coverImage.name}</p>}
              </div>
            </div>
            {errors.coverImage && <p className="mt-1 text-sm text-red-600">{errors.coverImage}</p>}
          </div>

          <div>
            <label htmlFor="bookFile" className="block text-sm font-medium text-gray-700 mb-1">
              Book File (PDF) *
            </label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${errors.bookFile ? "border-red-300" : "border-gray-300"
                } border-dashed rounded-md`}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="bookFile"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="bookFile"
                      name="bookFile"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleBookFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 50MB</p>
                {bookFile && <p className="text-xs text-green-500">{bookFile.name}</p>}
              </div>
            </div>
            {errors.bookFile && <p className="mt-1 text-sm text-red-600">{errors.bookFile}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/admin/books")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Adding Book..." : "Add Book"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddBook
