'use client';

import React from 'react';
import Header from '@/components/shared/PageHeader';

export default function ClientMessagingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Messaging" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
          {/* Sidebar */}
          <div className="bg-cardBackground rounded-lg shadow">
            <div className="p-4 border-b border-buttonBorder">
              <h2 className="text-lg font-semibold text-textPrimary">Conversations</h2>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full px-3 py-2 border border-buttonBorder rounded-md text-sm"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto h-[calc(100vh-280px)]">
              <div className="p-3 border-b border-buttonBorder bg-darkerBackground cursor-pointer">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-textPrimary">Sarah Johnson</h3>
                  <span className="text-xs text-textSecondary">10:24 AM</span>
                </div>
                <p className="text-sm text-textSecondary truncate mt-1">
                  Thanks for providing the updated workflow details. We'll review them shortly.
                </p>
              </div>
              
              <div className="p-3 border-b border-buttonBorder cursor-pointer hover:bg-darkerBackground">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-textPrimary">Michael Chen</h3>
                  <span className="text-xs text-textSecondary">Yesterday</span>
                </div>
                <p className="text-sm text-textSecondary truncate mt-1">
                  The new automation is working great! We've already seen a 30% reduction in processing time.
                </p>
              </div>
              
              <div className="p-3 border-b border-buttonBorder cursor-pointer hover:bg-darkerBackground">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-textPrimary">Support Team</h3>
                  <span className="text-xs text-textSecondary">May 20</span>
                </div>
                <p className="text-sm text-textSecondary truncate mt-1">
                  We've resolved the issue with your invoice processing workflow. Please let us know if you have any other questions.
                </p>
              </div>
              
              <div className="p-3 border-b border-buttonBorder cursor-pointer hover:bg-darkerBackground">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-textPrimary">Jessica Martinez</h3>
                  <span className="text-xs text-textSecondary">May 18</span>
                </div>
                <p className="text-sm text-textSecondary truncate mt-1">
                  I've scheduled a follow-up call for next Tuesday at 2pm to discuss your implementation progress.
                </p>
              </div>
              
              <div className="p-3 border-b border-buttonBorder cursor-pointer hover:bg-darkerBackground">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-textPrimary">David Wilson</h3>
                  <span className="text-xs text-textSecondary">May 15</span>
                </div>
                <p className="text-sm text-textSecondary truncate mt-1">
                  Here are the training materials we discussed during our last meeting.
                </p>
              </div>
            </div>
            
            <div className="p-3 border-t border-buttonBorder">
              <button className="w-full bg-buttonPrimary text-white py-2 rounded-md hover:bg-opacity-90 transition-colors">
                New Message
              </button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="bg-cardBackground rounded-lg shadow col-span-3 flex flex-col">
            <div className="p-4 border-b border-buttonBorder">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-textPrimary">Sarah Johnson</h2>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-darkerBackground rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-darkerBackground rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 7l-7 5 7 5V7z"></path>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex justify-start">
                <div className="bg-darkerBackground p-3 rounded-lg max-w-[70%]">
                  <p className="text-textPrimary">Hi there! I wanted to check in on how the implementation is going for your team.</p>
                  <span className="text-xs text-textSecondary block mt-1">10:05 AM</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <div className="bg-buttonPrimary text-white p-3 rounded-lg max-w-[70%]">
                  <p>Thanks for checking in, Sarah. Things are going well with the new workflows. We've already started seeing some efficiency gains.</p>
                  <span className="text-xs text-gray-300 block mt-1">10:12 AM</span>
                </div>
              </div>
              
              <div className="flex justify-start">
                <div className="bg-darkerBackground p-3 rounded-lg max-w-[70%]">
                  <p className="text-textPrimary">That's great to hear! Have you had a chance to review the documentation for the newest features we're planning to roll out next month?</p>
                  <span className="text-xs text-textSecondary block mt-1">10:15 AM</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <div className="bg-buttonPrimary text-white p-3 rounded-lg max-w-[70%]">
                  <p>Yes, I went through it yesterday. I have a few questions about the data integration aspects. When would be a good time to discuss?</p>
                  <span className="text-xs text-gray-300 block mt-1">10:20 AM</span>
                </div>
              </div>
              
              <div className="flex justify-start">
                <div className="bg-darkerBackground p-3 rounded-lg max-w-[70%]">
                  <p className="text-textPrimary">Thanks for providing the updated workflow details. We'll review them shortly and get back to you with any questions or feedback.</p>
                  <span className="text-xs text-textSecondary block mt-1">10:24 AM</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-buttonBorder">
              <div className="flex items-center">
                <button className="p-2 hover:bg-darkerBackground rounded-full mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg>
                </button>
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 border border-buttonBorder rounded-md px-3 py-2"
                />
                <button className="p-2 hover:bg-darkerBackground rounded-full ml-2 bg-buttonPrimary text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
