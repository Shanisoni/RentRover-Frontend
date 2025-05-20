/**
 * @description User Chat Controller - Handles real-time chat functionality for car renters
 */
myApp.controller("userChatController", [
  "$scope",
  "chatService",
  "$timeout",
  "ToastService",
  "BASE_URL",
  function ($scope, chatService, $timeout, ToastService, BASE_URL) {
    // ==========================================
    // State Management
    // ==========================================
    
    // Chat state
    $scope.chats = []; 
    $scope.messages = [];
    $scope.currentMessage = { messageText: "" };
    $scope.selectedChat = null;
    $scope.isLoading = false;
    let socket;

    // Image upload state
    $scope.imageToUpload = null;
    $scope.imagePreviewUrl = null;
    $scope.imageModalUrl = null;
    $scope.uploadingImage = false;

    // ==========================================
    // Initialization
    // ==========================================
    
    /**
     * @description Initialize the chat controller - Sets up socket connection and loads initial chats
     */
    $scope.init = function() {
      $scope.isLoading = true;
      
      // Initialize socket connection
      socket = io(`${BASE_URL}`);

      // Listen for new messages
      socket.on("newMessage", function (data) {
        if ($scope.selectedChat && data.chatId === $scope.selectedChat._id) {
          $timeout(function () {
            $scope.messages.push(data);
            scrollToBottom();
          });
        }
      });

      // Load initial chats
      $scope.getAllChats()
        .finally(() => {
          $scope.isLoading = false;
        });
    };
  
    // ==========================================
    // Chat Operations
    // ==========================================

    /**
     * @description Fetch all chats for the user from the server
     * @returns {Promise} Promise that resolves with chat data
     */
    $scope.getAllChats = function() {
      return chatService.getChats()
        .then((allChats) => {
          $scope.chats = allChats || [];
        })
        .catch((e) => {
          ToastService.error("Error fetching chats", 3000);
        });
    };
  
    /**
     * @description Select a chat and load its messages from the server
     * @param {Object} chat - The chat to select and load
     */
    $scope.selectChat = function(chat) {
      $scope.selectedChat = chat;
      
      // Reset states
      $scope.messages = [];
      $scope.cancelImageUpload();
      $scope.isLoading = true;
      
      // Join chat room
      socket.emit("joinChat", chat._id);

      // Load chat messages
      chatService.getSelectedChatData(chat._id)
        .then((conversation) => {
          $scope.messages = conversation || [];
          
          // Scroll to bottom of messages after they load
          $timeout(() => {
            scrollToBottom();
          }, 100);
        })
        .catch((e) => {
          ToastService.error("Error loading conversation", 3000);
        })
        .finally(() => {
          $scope.isLoading = false;
        });
    };
  
    // ==========================================
    // Message Handling
    // ==========================================

    /**
     * @description Initiate the message sending process after validation
     * @param {string} messageText - The message text to send
     */
    $scope.sendMessage = function(messageText) {
      if (!$scope.selectedChat) return;
      
      // Don't send if no text AND no image
      if ((!messageText || !messageText.trim()) && !$scope.imageToUpload) return;
      
      sendChatMessage(messageText);
    };
    
    /**
     * @description Send a chat message with optional image attachment to the server
     * @param {string} messageText - The message text to send
     * @private
     */
    function sendChatMessage(messageText) {
      const formData = new FormData();

      // Prepare message data
      if (messageText) {
        formData.append('message', messageText);
      }

      // Handle image attachment
      if ($scope.imageToUpload) {
        if (!$scope.imagePreviewUrl) return;
        
        formData.append('image', $scope.imageToUpload);
        $scope.uploadingImage = true;
      }
      
      // Send message to server
      chatService.addNewMessage($scope.selectedChat._id, formData)
        .then((messageData) => {
          // Emit message via socket
          socket.emit("sendMessage", messageData.data);
          // Clear the message input after sending
          $scope.currentMessage.messageText = "";
        })
        .catch((error) => {
          const errorMessage = $scope.imageToUpload 
            ? "Error sending image" 
            : "Error saving message";
          ToastService.error(errorMessage, 3000);
        })
        .finally(() => {
          if ($scope.imageToUpload) {
            $scope.uploadingImage = false;
            $scope.cancelImageUpload();
          }
        });
    }
    
    // ==========================================
    // Image Handling
    // ==========================================

    /**
     * @description Handle image file selection, validation, and preview generation
     * @param {HTMLElement} element - The file input element containing the selected image
     */
    $scope.prepareImageUpload = function(element) {
      if (!element.files?.[0]) return;
      
      const file = element.files[0];
      
      // Validate image before processing
      if (!isValidImage(file)) {
        alert("Please select a valid image file (JPG, PNG or GIF) under 5MB.");
        element.value = '';
        return;
      }
      
      // Set up image preview
      $scope.imageToUpload = file;
      const reader = new FileReader();
      
      reader.onload = function(e) {
        $timeout(() => {
          $scope.imagePreviewUrl = e.target.result;
        });
      };
      
      reader.onerror = function() {
        alert("Error preparing image. Please try again.");
        $scope.cancelImageUpload();
      };
      
      reader.readAsDataURL(file);
    };
    
    /**
     * @description Reset all image upload related states and clear the file input
     */
    $scope.cancelImageUpload = function() {
      $scope.imageToUpload = null;
      $scope.imagePreviewUrl = null;
      
      const fileInput = document.getElementById('imageUpload');
      if (fileInput) fileInput.value = '';
    };
    
    // ==========================================
    // Utility Functions
    // ==========================================

    /**
     * @description Handle Enter key press for message sending, preventing new line on plain Enter
     * @param {Event} event - Keyboard event object
     */
    $scope.handleKeyPress = function(event) {
      if (event.keyCode === 13 && !event.shiftKey) {
        event.preventDefault();
        $scope.sendMessage($scope.currentMessage.messageText);
      }
    };
    
    /**
     * @description Scroll the chat messages container to the bottom
     * @private
     */
    function scrollToBottom() {
      $timeout(() => {
        const container = document.getElementById('messagesContainer');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 20);
    }
    
    /**
     * @description Validate image file type and size constraints
     * @param {File} file - The file to validate
     * @returns {boolean} Whether the file meets all validation criteria
     * @private
     */
    function isValidImage(file) {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        return false;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      return validTypes.includes(file.type);
    }

     // Toggle chat list visibility for mobile
     $scope.toggleChatList = function() {
      $scope.isChatListVisible = !$scope.isChatListVisible;
    };

    // Initialize controller
    $scope.init();
  }
]);
