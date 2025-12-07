/**
 * Master class manager for the application.
 */
class Manager {
    private static instance: Manager;
    public static get INSTANCE(): Manager { return this.instance; }

    constructor() {
        // Ensure singleton instance
        if (Manager.instance) {
            throw new Error("Manager is a singleton class and cannot be instantiated multiple times.");
        }
        Manager.instance = this;

        // Initialize the other managers
        new SceneManager();
        new UIManager();

        // Wait for DOM and IFRAME contents to finish loading
        window.addEventListener("DOMContentLoaded", async () => {
            await SceneManager.INSTANCE.waitForIFramesToLoad();
            // Wait a bit for UI initialization
            await new Promise(resolve => setTimeout(resolve, 100));
            // Load the initial scene
            console.log("Loading Scene 0");
            SceneManager.INSTANCE.loadScene("Scene0");
        });
    }
}

new Manager();