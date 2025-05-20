/**
 * @description Owner Chat Controller - Handles real-time chat functionality for car owners
 */
myApp.controller("ownerChatController", [
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
    $scope.isLoadingChat = false;
    $scope.isChatListVisible = false; // For mobile chat list visibility
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
     * @description Fetch all chats for the owner from the server
     * @returns {Promise} Promise that resolves with chat data
     */
    $scope.getAllChats = function() {
      return chatService.getChats()
        .then((allChats) => {
          $scope.chats = allChats || [];
        })
        .catch((e) => {
          ToastService.error("Unable to fetch chats", 3000);
        });
    };

    /**
     * @description Select a chat and load its messages from the server
     * @param {Object} chat - The chat to select and load
     */
    $scope.selectChat = function(chat) {      
      $scope.isLoadingChat = true;
      $scope.selectedChat = chat;
      
      // Hide chat list on mobile after selection
      if (window.innerWidth < 992) { // md breakpoint is 992px
        $scope.isChatListVisible = false;
      }
      
      // Reset states
      $scope.messages = [];
      $scope.cancelImageUpload();

      // Join chat room
      socket.emit("joinChat", chat._id);

      // Load chat messages
      chatService.getSelectedChatData(chat._id)
        .then((conversation) => {
          $scope.messages = conversation || [];
          scrollToBottom();
        })
        .catch((e) => {
          ToastService.error("Unable to fetch chat data", 3000);
        })
        .finally(() => {
          $scope.isLoadingChat = false;
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
      // Validate chat selection and message content
      if (!$scope.selectedChat) return;
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
          $scope.currentMessage.messageText = "";
        })
        .catch((error) => {
          const errorMessage = $scope.imageToUpload 
            ? "Error sending message" 
            : "Unable to add message";
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
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        return false;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return false;
      }

      return true;
    }

    // Toggle chat list visibility for mobile
    $scope.toggleChatList = function() {
      $scope.isChatListVisible = !$scope.isChatListVisible;
    };

    // Initialize controller
    $scope.init();
  }
]);