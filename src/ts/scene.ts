/**
 * Basic Generic scene class 
 */
abstract class Scene {
    protected abstract directoryHeader: string;
    protected abstract sceneName: string
    protected abstract description: string;

    constructor() {
        this.initializeCommunication();
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