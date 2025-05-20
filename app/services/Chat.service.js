/**
 * @description Chat Service - Handles real-time chat operations between users and car owners
 * Provides methods for chat creation, message handling, and conversation management
 */
myApp.service("chatService", [
  "$q",
  "ToastService",
  "$http",
  "BASE_URL",
  function ($q, ToastService, $http,BASE_URL) {
    // ==========================================
    // Chat Management
    // ==========================================
    
    /**
     * @description Create a new chat or retrieve existing chat between user and owner
     * @param {Object} owner - The car owner's details
     * @param {Object} car - The car details for the chat context
     * @returns {Promise<Object>} Promise resolving to chat details {_id, participants, messages, etc.}
     */
    this.addChat = function (owner, car) {
      let deferred = $q.defer();
      let chatObject = {
        "car":car,
        "owner":owner,
      };
      $http.post(`${BASE_URL}/api/chat/addNewChat`,chatObject) 
      .then((response) => {
        socket = io(`${BASE_URL}`);
        socket.emit("joinChat", response.data._id);
        deferred.resolve(response.data);
      }
      )
      .catch((e) => {
        deferred.reject(e);
      }
      );
        
      return deferred.promise;
    };

    // ==========================================
    // Chat Retrieval
    // ==========================================
    
    /**
     * @description Fetch all chats associated with the current user
     * @returns {Promise<Array>} Promise resolving to array of chat objects
     */
    this.getChats = function(){
      let deferred=$q.defer();
      $http
      .get(`${BASE_URL}/api/chat/getChats`)
      .then((response)=>{
        deferred.resolve(response.data);
      }).catch((e)=>{
        deferred.reject(e);
      })
      return deferred.promise;
    }

    /**
     * @description Fetch conversation history for a specific chat
     * @param {string} id - The chat ID to fetch conversation for
     * @returns {Promise<Array>} Promise resolving to array of message objects
     */
    this.getSelectedChatData = function(id){
      let deferred=$q.defer();
     $http.get(`${BASE_URL}/api/chat/getConversation/${id}`)
      .then((allConversation)=>{
        deferred.resolve(allConversation.data);
      }).catch((e)=>{
        deferred.reject(e);
      })
      return deferred.promise;
    }

    // ==========================================
    // Message Operations
    // ==========================================
    
    /**
     * @description Send a new message in a chat
     * @param {string} id - The chat ID to send message to
     * @param {FormData} messageData - The message data including text and/or image
     * @returns {Promise<Object>} Promise resolving to the sent message details
     */
    this.addNewMessage = function(id,messageData){
      let deferred=$q.defer();    
      let config = {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      };
      $http.post(`${BASE_URL}/api/chat/sendMessage/${id}`,messageData, config).then((messageData)=>{
        
        deferred.resolve(messageData.data);
      })
      .catch((e)=>{
        deferred.reject("Failed to send message");
      })
     return deferred.promise;
    }

  },
]);
