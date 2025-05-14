import { BookOpen, Users, BookMarked, Award } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">About CSLearn Bookstore</h1>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="mb-4">
              Welcome to CSLearn Bookstore, your premier destination for computer science and programming literature. Founded in 2018, CSLearn began as a small corner shop with a vision to create a specialized haven for technology enthusiasts, students, and professionals alike.
            </p>
            
            <p className="mb-6">
              What started as a modest collection of programming books has now grown into a comprehensive library spanning all aspects of computer science—from foundational theories to cutting-edge technologies like artificial intelligence, blockchain, and quantum computing.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="mb-6">
              At CSLearn, we believe that knowledge should be accessible to everyone passionate about technology. Our mission is to curate the finest selection of computer science resources, foster a community of learners, and provide expert guidance to help our customers excel in their technological journeys.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center">
                <BookOpen className="h-10 w-10 text-blue-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Curated Selection</h3>
                <p className="text-gray-600">
                  Over 5,000 carefully selected titles covering every aspect of computer science and programming.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center">
                <Users className="h-10 w-10 text-blue-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Expert Staff</h3>
                <p className="text-gray-600">
                  Our team includes former developers, CS professors, and tech industry veterans.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center">
                <BookMarked className="h-10 w-10 text-blue-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Learning Community</h3>
                <p className="text-gray-600">
                  Regular workshops, coding clubs, and author events to strengthen your learning.
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center">
                <Award className="h-10 w-10 text-blue-600 mb-3" />
                <h3 className="font-semibold text-lg mb-2">Recognized Excellence</h3>
                <p className="text-gray-600">
                  Awarded "Best Technical Bookstore" three years running by TechLit Magazine.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Visit Us Today</h2>
            <p>
              Whether you're taking your first steps in programming or advancing your expertise in machine learning, CSLearn is your trusted companion on the path to mastery. Visit our store to browse our extensive collection, attend one of our events, or simply chat with our knowledgeable staff about your next learning adventure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}