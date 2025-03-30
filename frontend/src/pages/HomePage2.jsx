import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatList from "../components/chatList";
import Conversation from "../components/conversation";
import { useSocket } from "../contexts/SocketContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const HomePage2 = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Check if it's mobile
  const { isConnected, joinChatRoom } = useSocket();
  const [hasJoinedInitialRoom, setHasJoinedInitialRoom] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Verify user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    
    if (!token || !userId) {
      console.warn("No authentication credentials found, redirecting to login");
      setAuthError(true);
      
      // Small delay to show any error messages
      setTimeout(() => {
        navigate("/login");
      }, 100);
    }
  }, [navigate]);

  // Check if we received an auth error from a child component
  useEffect(() => {
    const handleAuthError = (event) => {
      if (event.detail && event.detail.type === 'AUTH_ERROR') {
        console.warn("Authentication error detected, redirecting to login");
        setAuthError(true);
        navigate("/login");
      }
    };
    
    // Listen for custom auth error events
    window.addEventListener('authError', handleAuthError);
    
    return () => {
      window.removeEventListener('authError', handleAuthError);
    };
  }, [navigate]);

  // Update `isMobile` on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch a specific chat by ID
  const fetchChatById = async (chatId) => {
    try {
      setIsLoadingChat(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.warn("No token found for fetching chat");
        setAuthError(true);
        return null;
      }
      
      const response = await fetch(`${API_URL}/api/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        console.warn("Auth error while fetching chat");
        setAuthError(true);
        return null;
      }
      
      if (!response.ok) {
        console.error("Error fetching chat:", response.status);
        return null;
      }
      
      const chatData = await response.json();
      return chatData;
    } catch (error) {
      console.error("Error fetching chat:", error);
      return null;
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Handle state from navigation (with support for selectedChatId)
  useEffect(() => {
    if (authError) return;
    
    if (location.state) {
      // Handle case where we get a selectedChatId (from FriendsPage)
      if (location.state.selectedChatId && !selectedChat) {
        const chatId = location.state.selectedChatId;
        setSelectedChatId(chatId);
        
        console.log(`Got selectedChatId from navigation: ${chatId}`);
        
        // Need to fetch the full chat data
        fetchChatById(chatId).then(chatData => {
          if (chatData) {
            console.log("Fetched chat data:", chatData);
            setSelectedChat(chatData);
            
            // Make sure we join the chat room
            if (isConnected) {
              console.log(`Joining chat room from selectedChatId: ${chatId}`);
              joinChatRoom(chatId);
              
              // Mark that we've joined a room initially if from friends page
              if (location.state.fromFriendsPage) {
                setHasJoinedInitialRoom(true);
              }
            }
          }
        });
      }
      // Handle case where we get a full selectedChat object
      else if (location.state.selectedChat) {
        setSelectedChat(location.state.selectedChat);
        setSelectedChatId(location.state.selectedChat._id);
        
        // Make sure we join the chat room
        if (isConnected && location.state.selectedChat?._id) {
          console.log(`Joining chat room from navigation: ${location.state.selectedChat._id}`);
          joinChatRoom(location.state.selectedChat._id);
          
          // Mark that we've joined a room initially if from friends page
          if (location.state.fromFriendsPage) {
            setHasJoinedInitialRoom(true);
          }
        }
      }
    }
  }, [location, isConnected, joinChatRoom, authError, selectedChat]);

  // When connection status changes, rejoin chat room if needed
  useEffect(() => {
    if (!authError && isConnected && selectedChatId) {
      console.log("Connection changed, rejoining chat room:", selectedChatId);
      joinChatRoom(selectedChatId);
      setHasJoinedInitialRoom(true);
    }
  }, [isConnected, selectedChatId, joinChatRoom, authError]);

  // Handle chat selection
  const handleChatSelect = (chat) => {
    if (authError) return;
    
    setSelectedChat(chat);
    setSelectedChatId(chat._id);
    
    // Make sure we join the chat room
    if (isConnected && chat?._id) {
      console.log(`Joining chat room from selection: ${chat._id}`);
      joinChatRoom(chat._id);
      setHasJoinedInitialRoom(true);
    }
  };

  // When a chat ID has changed (due to chat re-creation)
  const handleChatIdChanged = async (newChatId) => {
    console.log(`Chat ID has changed to ${newChatId}, fetching new chat data`);
    
    if (newChatId === selectedChatId) {
      console.log("New chat ID is the same as current, ignoring");
      return;
    }
    
    // Fetch the updated chat data
    const updatedChat = await fetchChatById(newChatId);
    
    if (updatedChat) {
      console.log("Updated chat data received:", updatedChat);
      // Update the selected chat
      setSelectedChat(updatedChat);
      setSelectedChatId(newChatId);
      
      // Make sure we join the new chat room
      if (isConnected) {
        console.log(`Joining new chat room: ${newChatId}`);
        joinChatRoom(newChatId);
      }
      
      // Update URL if needed
      if (window.history && window.history.replaceState) {
        const newUrl = `/?chat=${newChatId}`;
        window.history.replaceState(
          { selectedChatId: newChatId },
          '',
          newUrl
        );
      }
    } else {
      console.error("Failed to fetch updated chat data");
    }
  };

  // If we're in an error state or redirecting, show minimal UI
  if (authError) {
    return (
      <div className="fixed inset-0 pt-16 bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800">Authentication Required</h3>
          <p className="text-gray-500 mt-2">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pt-16 bg-gray-50">
      <div className="flex h-full overflow-hidden">
        {/* Chat list panel */}
        <div className={`${isMobile && selectedChat ? 'hidden' : 'flex'} w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 flex-col bg-white`}>
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-800">Conversations</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChatList 
              onChatSelect={handleChatSelect} 
              selectedChatId={selectedChatId} 
              onAuthError={() => {
                // Dispatch auth error event
                window.dispatchEvent(new CustomEvent('authError', {
                  detail: { type: 'AUTH_ERROR' }
                }));
              }}
            />
          </div>
        </div>

        {/* Conversation panel */}
        <div className={`${isMobile && !selectedChat ? 'hidden' : 'flex'} flex-col flex-1 bg-gray-50`}>
          {isLoadingChat ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center p-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-medium text-gray-800">Loading conversation</h3>
                <p className="text-gray-500 mt-2">Please wait while we fetch your chat</p>
              </div>
            </div>
          ) : selectedChat ? (
            <Conversation 
              chatId={selectedChatId} 
              onBack={() => {
                setSelectedChat(null);
                setSelectedChatId(null);
              }} 
              chatName={selectedChat?.otherUser?.name || 'Chat'}
              hasJoinedRoom={hasJoinedInitialRoom}
              onAuthError={() => {
                // Dispatch auth error event
                window.dispatchEvent(new CustomEvent('authError', {
                  detail: { type: 'AUTH_ERROR' }
                }));
              }}
              onChatIdChanged={handleChatIdChanged}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center p-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-800">No conversation selected</h3>
                <p className="text-gray-500 mt-2">Choose a conversation from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage2;





