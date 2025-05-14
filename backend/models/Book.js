const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  author: {
    type: String,
    required: [true, 'Please provide an author'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  semester: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5, 6]
  },
  stream: {
    type: String,
    required: true,
    enum: ['All','PHO','DP','ARCH','FWT','CST','ME','CE','SE','CFS','EE','ETCE','CAU','CSE','CSWT','IT','ETE','ICE','ECE','LGT','MEP','GIS & GPS','EEIC','EEPS','EEE','MOPM','TT',''] // Common diploma streams
  },
  subject: {
    type: String,
    required: true,
    enum: ['Applied Physics','Applied Chemistry','Mathematics-I','Communication skills in English','Principles of Management','Stenography','Business Mathematics','Behavioural Principles','Introduction to Hospitality Management','Travel & Tourism Industry','Basic Computer Fundamentals','Principles of Marketing-I','Applied Physics-II','FEEE','Mathematics-II','Introduction to IT Systems','Engineering Mechanics','Basic Photography I','Basic Photography II','Basic Engineering for Printing','Material Science for Printing','Architectural Drawing-II','Architectural Basic Design','Basic Engineering for Footwear Manufacture','Principles of Footwear Manufacture','Elements of Footwear Designing & Pattern Cutting','Footwear Manufacturing Techniques-I','Footwear Material Study-I','Footwear Auxillary Materials','Scripting Languages','Computer Programming in C','Data Structures','Computer System Organisation','Algorithms','Operating Systems','Introduction to DBMS','Computer Networks','Software Engineering','OOP using Java','Microprocessor & Microcontroller','IOT','Theory of Automata','Advanced Computer Network','Computer Graphics','Enterpreneurship & Start-ups','Engineering Economics & Project Management','Machine Learning','Data Science-Data Warehousing & Data Mining','Mechanical Engineering Drawing','Mechanical Engineering Materials','Strength of Materials','Manufacturing Processes-I','Thermal Engineering-I','Theory of Machine','Manufacturing Process-II','Thermal Engineering-II','Engineering Metrology','Refrigeration & Air Conditioning','Power Engineering','Advanced Manufacturing Processes','Fluid Mechanics & Machinery','Power Plant Engineering','Automobile Engineering','Design of Machine Elements','Mechatronics','Work,Organisation & Management','Construction Materials','Basic Surveying','Mechanics of Materials','Building Construction','Concrete Technology','Civil Engineering Planning & Drawing','Transportion Engineering','Hydraulics','Advanced Surveying','Theory of Structure','Geotechnical Engineering','Design of RCC and Steel Structure','Rural Construction Technology','Water Resource Engineering','Estimating,Costing and Valuation','Software Engineering & Management in the Construction Sector','Traffic Engineering','Building Services and Maintenance','Public Health Engineering', 'Advanced Construction Technology','Surveying-I','Surveying-II','Building Construction Practices','Cadastral Survey and Land Laws','Mechanics of Material','Concrete Technology','Mine Surveying','Geodesy and Astronomy','Surveying III','Photogrammetry and Remote Sensing','Triangulation & Trilateration','Estimating, Costing, Specification and Valuation','Design of R.C.C. Structure','Railway & Tunnel Survey',' Advanced Survey','Route Survey','Water Resource Engineering','Construction Engineering','Transmission Line Survey','Building Planning and Drawing','Discrete Structures','Data Communication and Networking','Introduction to Cyber Security','Cyber Security Laws','Web Designing and Multimedia Technology','CyberCrime Investigation and Cyber Forensics','Introduction to cryptography','Intrusion Detection and Penetration Testing','Mobile Phone Security','Cyber Security Vulnerabilities & Safeguards','Basics of Security Operations and Threat Modeling','Network Security Management','Introduction to Electric Generation Systems','Electrical Circuits','Electrical and Electronic Measurement','DC Machines and Transformers','Analog and Digital Circuits','Power Electronics Converters and Application','Electric Power Transmission and Distribution','Induction,Synchronus and Special Electrical Machines','Renewable Energy Power Plants','Switchgear and Protection','Microcontroller and its applications','Building Electrification','Industrial Automation & Control','Solar Power Technologies','Energy Convertion and Audit','Industrial Instrumentation & Condition Monitoring','Computer Programming Language','Electronic Devices and Circuits','Digital Electronics','Electric Circuits and Network','Principles of Electronic Communication','Consumer Electronics','Linear Integrated Circuits','Electronic Measurements and Instrumentation','Digital and Microwave Communication Systems','Embedded Systems','Advanced Communication System','Industrial Electronics','Industrial Automation','Computer Networking and Data Communication','Construction Methods and Equipment Management','Advanced Surveying','Theory of Structure and Mechanism','Geotechnical Engineering','Design of RCC Structure','Precast & Prestressed Concrete','Safety in Construction','Electrical Machine & Measurement','Circuit Theory','Fundamentals of Instrumentation','Electronics Instruments and Measurement','Process Instrumentation','Industrial Electronics I','Process Control-I','Optical Instrumentation','Process Instrumentation II','Process Control-II','Analytical Instrumentation','Biomedical Instrumentation','Electronic Communication Principle','Industrial Buses and Networks','Electrical Machine and Measurement','Fundamentals of Electrical Circuit and Network','Basic Instrumentation & Control','Industrial Instrumentation-I','Applied Electronics & Electric Measuring Instruments','Biomedical Instrumentation','Industrial Instrumentation-II','Advanced Process Control','Analytical & Optical Instrumentation','History of Art and Fashion','Designing Principles and Development','Fashion Studies for Leather Goods','Fundamental of Leather Goods Manufacturing','Essential Management Studies for Leather Goods Industry','Designing Problems & Solutions','Production Planning & Quality Assurance','Leather Goods Costing','Leather Goods Construction Technique','Leather Goods Marketing & Merchadsing','Fundamental of Footwear Technology','Leather Goods Machinery','Material Science for Leather Goods-II','Leather Goods Packaging and Labelling','Basic Garment Design','E-Commerce','Fundamentals of Safety Leather Gloves','Basics of Garment Construction','Industrial Management and Safety','Spatial Statistics-I','Cartography in GIS','Basic Concept of Navigation','Problem Solving and Coding','Applied Surveying','Spatial Statistics-II','Advance Surveying','Digital Image Processing','Geographic Information System','Database Management System Post GIS','Remote Sensing','Geo-Informatics','Application of GIS in Urban Planning','AI','Application of GIS and Planning','Application of GIS in Diaster Management','Power Electronics Converters and Applications','Electric Power Transmission and Distribution','Induction, Synchronus and Special Electrical Machines','Industrial Instrumentation & Control System','Switchgear and Prediction','Principles of Electronics Communication','Illumination Practices']
  },
  coverImage: {
    type: String,
    required:true
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide a file URL']
  },
  fileId: {
    type: String,
    required: [true, 'File ID is required']
  },
  tags: [String],
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', BookSchema);
