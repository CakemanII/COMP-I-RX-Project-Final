/**
 * Master class manager for the application.
 */
class Manager {
    private static instance: Manager;
    public static get INSTANCE(): Manager { return this.instance; }

    private maxCompletedSceneIndex: number = -1;
    private currentProgress: number = 0;
    private sceneProgressMap: Map<number, number> = new Map();
    
    private backButton!: HTMLElement;
    private nextButton!: HTMLElement;

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
            this.initializeNavigationButtons();
            this.initializeProgressUpdateCommunication();

            // Wait for all IFRAMEs to load
            await SceneManager.INSTANCE.waitForAllIFramesToLoad();

            // Wait for UIManager to initialize
            await UIManager.INSTANCE.waitForInitialization();
            
            // Load the initial scene
            SceneManager.INSTANCE.loadScene("Scene0");
            this.updateNavigationButtons();
        });
    }

    /**
     * Initialize navigation button references and click handlers
     */
    private initializeNavigationButtons(): void {
        const navButtons = document.querySelectorAll('.nav-button');
        this.backButton = navButtons[0] as HTMLElement;
        this.nextButton = navButtons[1] as HTMLElement;

        // Back button click handler
        this.backButton.addEventListener('click', () => {
            if (this.backButton.classList.contains('clickable')) {
                this.goToPreviousScene();
            }
        });

        // Next button click handler
        this.nextButton.addEventListener('click', () => {
            if (this.nextButton.classList.contains('clickable')) {
                this.goToNextScene();
            }
        });
    }

    /**
     * Initialize progress update communication from scenes
     */
    private initializeProgressUpdateCommunication(): void {
        window.addEventListener("message", (event: MessageEvent) => {
            const messageData = event.data;
            if (messageData && messageData.type === "PROGRESS_UPDATE") {
                this.incrementProgress();
            }
        });
    }

    /**
     * Increment scene progress and update UI
     */
    private async incrementProgress(): Promise<void> {
        // Ensure UI is initialized before accessing scene data
        await UIManager.INSTANCE.waitForInitialization();
        
        this.currentProgress++;
        const currentSceneIndex = SceneManager.INSTANCE.CURRENT_SCENE_INDEX;
        const maxProgress = UIManager.INSTANCE.getCurrentSceneMaxProgress();
        
        // Store progress for this scene
        this.sceneProgressMap.set(currentSceneIndex, this.currentProgress);
        
        // Update progress bar with current value and max (with animation)
        UIManager.INSTANCE.setProgressBarValue(this.currentProgress, maxProgress, true);
        
        // Check if scene is completed
        if (this.currentProgress >= maxProgress) {
            // Mark this scene as completed
            if (currentSceneIndex > this.maxCompletedSceneIndex) {
                this.maxCompletedSceneIndex = currentSceneIndex;
            }
            this.updateNavigationButtons();
        }
    }

    /**
     * Update navigation button states based on current scene
     */
    private updateNavigationButtons(): void {
        const currentSceneIndex = SceneManager.INSTANCE.CURRENT_SCENE_INDEX;
        const totalScenes = SceneManager.INSTANCE.getTotalSceneCount();

        // Back button: active if not on first scene
        if (currentSceneIndex > 0) {
            this.backButton.classList.remove('not-clickable');
            this.backButton.classList.add('clickable');
        } else {
            this.backButton.classList.remove('clickable');
            this.backButton.classList.add('not-clickable');
        }

        // Next button: active if current scene is completed or if we can go forward
        if (this.maxCompletedSceneIndex >= currentSceneIndex && currentSceneIndex < totalScenes - 1) {
            this.nextButton.classList.remove('not-clickable');
            this.nextButton.classList.add('clickable');
        } else {
            this.nextButton.classList.remove('clickable');
            this.nextButton.classList.add('not-clickable');
        }
    }

    /**
     * Go to the previous scene
     */
    private async goToPreviousScene(): Promise<void> {
        const currentSceneIndex = SceneManager.INSTANCE.CURRENT_SCENE_INDEX;
        if (currentSceneIndex > 0) {
            await SceneManager.INSTANCE.loadSceneByIndex(currentSceneIndex - 1);
            this.loadProgressForScene();
            this.updateNavigationButtons();
        }
    }

    /**
     * Go to the next scene
     */
    private async goToNextScene(): Promise<void> {
        const currentSceneIndex = SceneManager.INSTANCE.CURRENT_SCENE_INDEX;
        const totalScenes = SceneManager.INSTANCE.getTotalSceneCount();
        
        if (currentSceneIndex < totalScenes - 1 && this.maxCompletedSceneIndex >= currentSceneIndex) {
            await SceneManager.INSTANCE.loadSceneByIndex(currentSceneIndex + 1);
            this.loadProgressForScene();
            this.updateNavigationButtons();
        }
    }

    /**
     * Load saved progress for current scene
     */
    private loadProgressForScene(): void {
        const currentSceneIndex = SceneManager.INSTANCE.CURRENT_SCENE_INDEX;
        const maxProgress = UIManager.INSTANCE.getCurrentSceneMaxProgress();
        
        // Get saved progress for this scene, default to 0 if not found
        this.currentProgress = this.sceneProgressMap.get(currentSceneIndex) || 0;
        
        // Update progress bar with saved progress (no animation when switching scenes)
        UIManager.INSTANCE.setProgressBarValue(this.currentProgress, maxProgress, false);
    }
}

new Manager();