"use client";

import { useState, useEffect } from "react";

export default function InboxPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // In a real app, this would fetch from /api/v1/inquiries
  useEffect(() => {
    // Mock data for UI demonstration
    setInquiries([
      { id: "1", title: "Inquiry on Clean PET Bottles", status: "OPEN", lastActive: "10 mins ago" },
      { id: "2", title: "Sample Request for Copper Slag", status: "IN_PROGRESS", lastActive: "2 hours ago" },
    ]);
  }, []);

  useEffect(() => {
    if (selectedInquiry) {
      setMessages([
        { id: "1", sender: "Buyer", text: "Is the moisture content strictly <5%?", time: "10:00 AM", isSelf: false },
        { id: "2", sender: "Producer", text: "Yes, it is guaranteed <5%. We can send a sample.", time: "10:15 AM", isSelf: true },
      ]);
    }
  }, [selectedInquiry]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar / Inbox List */}
      <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Unified Inbox</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {inquiries.map(inq => (
            <div 
              key={inq.id}
              onClick={() => setSelectedInquiry(inq)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 ${selectedInquiry?.id === inq.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-gray-800 truncate">{inq.title}</h3>
                <span className="text-xs text-gray-500">{inq.lastActive}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${inq.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {inq.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col bg-gray-50">
        {selectedInquiry ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
              <h2 className="text-lg font-bold text-gray-800">{selectedInquiry.title}</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 hover:bg-gray-50">
                  Request Sample
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700">
                  Accept Offer
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-500 mb-1">{msg.sender} • {msg.time}</span>
                  <div className={`px-4 py-2 rounded-lg max-w-md ${msg.isSelf ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input 
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setNewMessage('')}
                />
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors"
                  onClick={() => setNewMessage('')}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select an inquiry to view the conversation
          </div>
        )}
      </div>
    </div>
  );
}
