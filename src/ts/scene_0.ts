/**
 * Start Menu
 */
class Scene0 {
    constructor() {
        this.initializeCommunication();
    }

    private incrementProgress(): void {
        console.log("Telling Scene Manager to go to Scene 1");
    }

    /**
     * Initialize communication with Scene Manager
     */
    private initializeCommunication(): void {
        // Listen for messages from Scene Manager
        window.addEventListener("message", (event) => {
            // Ensure it is from the parent window
            if (event.source !== window.parent) {
                return;
            }

            // Get Message Data
            const message = event.data;
            // Handle the message 
            if (message.type === "GET_INFO") {
                // Respond with scene information
                const sceneInfo = {
                    directoryHeader: "Introduction",
                    sceneName: "Test 1",
                    description: "Test info"
                };
                // Post the message back to the parent window with the secureTransferID
                window.parent.postMessage({ ...sceneInfo, secureTransferID: message.secureTransferID }, "*");
            }
        });
    }
}

// Initialize the scene
new Scene0();