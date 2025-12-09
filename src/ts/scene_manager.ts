/**
 * Scene Manager class
 * Handles scene display, transitions, and management.
 */
class SceneManager {
    private static instance: SceneManager;
    public static get INSTANCE(): SceneManager { return this.instance; }

    // Mapping of scene names to their order/index
    private readonly SCENE_ORDER: { [key: string]: number } = {
        "Scene0": 0,
    };

    // Mapping of Indexes to scene IFRAME IDs.
    private readonly SCENE_IFRAME_IDS: { [key: number]: string } = {
        0: "scene-0-iframe",
    };

    // Mapping of indexes to scene IFRAME ELements
    private sceneIframes: { [key: number]: HTMLIFrameElement } = {};

    // Current active scene index
    private currentSceneIndex: number = 0;
    public get CURRENT_SCENE_INDEX(): number { return this.currentSceneIndex; }

    constructor() {
        // Ensure singleton instance
        if (SceneManager.instance) {
            throw new Error("SceneManager is a singleton class and cannot be instantiated multiple times.");
        }
        SceneManager.instance = this;

        // Initialize communication
        this.initializeProgressUpdateCommunication();

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            window.addEventListener("DOMContentLoaded", () => {
                this.initializeIFrameReferences();
            });
        } else {
            // DOM already loaded
            this.initializeIFrameReferences();
        }
    }

    /**
     * Initialize the IFRAME element references.
     */
    private initializeIFrameReferences(): void {
        for (const index in this.SCENE_IFRAME_IDS) {
            // Get IFRAME element by ID
            const iframeId = this.SCENE_IFRAME_IDS[index];
            const iframeElement = document.getElementById(iframeId) as HTMLIFrameElement;
            // Ensure the IFRAME element exists
            if (!iframeElement) {
                // Log an error if the IFRAME is not found
                console.error(`IFRAME with ID "${iframeId}" not found in the DOM.`);
                continue; 
            }
            // Store the IFRAME element in the mapping
            this.sceneIframes[Number(index)] = iframeElement;
        }
    }

    /**
     * Initialize progress update communication
     */
    private initializeProgressUpdateCommunication(): void {
        window.addEventListener("message", (event: MessageEvent) => {
            const messageData = event.data;
            if (messageData && messageData.type === "PROGRESS_UPDATE") {
                // Update the progress bar in the UI Manager
                UIManager.INSTANCE.incrementProgressBar();
            }
        });
    }

    /**
     * Wait for all iframes to finish loading their content.
     */
    public async waitForIFramesToLoad(): Promise<void> {
        const loadPromises: Promise<void>[] = [];
        
        for (const index in this.sceneIframes) {
            const iframe = this.sceneIframes[index];
            
            // Check if iframe is already loaded
            if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                continue;
            }
            
            // Create a promise that resolves when the iframe loads
            const loadPromise = new Promise<void>((resolve) => {
                iframe.addEventListener('load', () => resolve(), { once: true });
            });
            
            loadPromises.push(loadPromise);
        }
        
        await Promise.all(loadPromises);
    }

    /**
     * Load a specific scene from the DOM, unloading all other scenes.
     * @param sceneName - Name of the scene to load
     */
    public loadScene(sceneName: string): void {
        // Get the scene index from the mapping
        const sceneIndex = this.SCENE_ORDER[sceneName];

        // Ensure the scene exists
        if (sceneIndex === undefined) {
            console.error(`Scene "${sceneName}" does not exist.`);
            return;
        }

        // Show the requested scene's IFRAME element
        const iframeElement = this.sceneIframes[sceneIndex];
        if (!iframeElement) {
            console.error(`Cannot show IFRAME for scene: ${sceneName}`);
            return;
        }

        // Unload all other scenes
        this.unloadAllScenes();
        
        // Load the requested scene
        iframeElement.style.display = "block";
        this.currentSceneIndex = sceneIndex;

        // Get and set the current scene information
        UIManager.INSTANCE.sceneChanged();
    }

    /**
     * Unload all scenes.
     */
    private unloadAllScenes(): void {
        // Logic to unload all scenes
        for (const sceneName in this.SCENE_ORDER) {
            console.log(`Unloading scene: ${sceneName}`);
            // Hide the corresponding IFRAME element
            const sceneIndex = this.SCENE_ORDER[sceneName];
            const iframeElement = this.sceneIframes[sceneIndex];
            // Warn if no IFRAME element is found
            if (!iframeElement) {
                console.warn(`Cannot hide IFRAME for scene: ${sceneName}`);
                continue;
            }
            // Hide the IFRAME element
            iframeElement.style.display = "none";
        }
    }

    /**
     * Get all scene UI information by querying each scene IFRAME.
     */
    public async getAllSceneUIInformations(): Promise<any[]> {
        // Wait for all iframes to be loaded
        await this.waitForIFramesToLoad();
        
        const sceneInfoPromises: Promise<any>[] = [];
        // Iterate through all scene IFRAMEs
        for (const index in this.sceneIframes) {
            // Get the window of the IFRAME
            const iframeElement = this.sceneIframes[index];
            const iframeWindow = iframeElement.contentWindow;
            // Ensure the IFRAME window exists
            if (!iframeWindow) {
                console.error(`Cannot access contentWindow for IFRAME of scene index: ${index}`);
                continue;
            }
            // Send message and wait for response
            const sceneInfoPromise = this.sendAndWaitToReceiveMessage(iframeWindow, "GET_INFO");
            sceneInfoPromises.push(sceneInfoPromise);
        }
        return Promise.all(sceneInfoPromises);
    }

    /**
     * Send a message to the specified IFRAME window and wait for a response, then return that response.
     */
    private async sendAndWaitToReceiveMessage(iframeWindow: Window, message: string): Promise<any> {
        // For secure transfer of information, generate a unique transfer ID
        const secureTransferID: string = Math.random().toString(36).substr(2, 9);

        return new Promise((resolve) => {
            // Setup Listening for the response message
            const listener = (event: MessageEvent) => {
                // Ensure the message is from the expected IFRAME
                if (event.source !== iframeWindow) {
                    return;
                }
                const messageData = event.data;
                // Check if the message has the matching transfer ID
                if (messageData && messageData.secureTransferID === secureTransferID) {
                    resolve(messageData);
                    // Remove the event listener after receiving the info
                    window.removeEventListener("message", listener);
                }
            };
            window.addEventListener("message", listener);

            // Post the message to the IFRAME with the transfer ID
            iframeWindow.postMessage({ type: message, secureTransferID: secureTransferID }, "*");
        });
    }
}