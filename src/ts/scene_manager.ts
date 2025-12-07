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
        "Scene1": 1,
        "Scene2": 2,
        "Scene3": 3,
        "Scene4": 4
    };

    // Mapping of Indexes to scene IFRAME IDs.
    private readonly SCENE_IFRAME_IDS: { [key: number]: string } = {
        0: "scene-0-iframe",
        1: "scene-1-iframe",
    };

    // Mapping of indexes to scene IFRAME ELements
    private sceneIframes: { [key: number]: HTMLIFrameElement } = {};

    // Current active scene index
    private currentSceneIndex: number = 0;

    constructor() {
        // Ensure singleton instance
        if (SceneManager.instance) {
            throw new Error("SceneManager is a singleton class and cannot be instantiated multiple times.");
        }
        SceneManager.instance = this;

        // Initialize scene IFRAME elements
        this.initializeIFrameReferences();

        // Load the initial scene
        this.loadScene("Scene0");
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
     * Load a specific scene from the DOM, unloading all other scenes.
     * @param sceneName - Name of the scene to load
     */
    private loadScene(sceneName: string): void {
        // Get the scene index from the mapping
        const sceneIndex = this.SCENE_ORDER[sceneName];

        // Ensure the scene exists
        if (sceneIndex === undefined) {
            console.error(`Scene "${sceneName}" does not exist.`);
            return;
        }

        // Unload all other scenes
        this.unloadAllScenes();

        // Show the requested scene's IFRAME element
        const iframeElement = this.sceneIframes[sceneIndex];
        if (iframeElement) {
            iframeElement.style.display = "block";
            this.currentSceneIndex = sceneIndex;
            console.log(`Loaded scene: ${sceneName}`);
        } else {
            console.error(`IFRAME for scene "${sceneName}" not found.`);
            return;
        }
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
}

// Initialize the Scene Manager singleton
new SceneManager();