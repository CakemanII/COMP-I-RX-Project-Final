/**
 * UI Manager Module
 * Handles the main UI components and interactions.
 */
class UIManager {
    private static instance: UIManager;
    public static get INSTANCE(): UIManager { return this.instance; }

    // Static HTML Element IDs & References
    private readonly DIRECTORY_ID: string = "directory-list";
    private directoryElement!: HTMLElement;

    private readonly PROGRESS_BAR_FILL_ID: string = "progress-bar";
    private progressBarFillElement!: HTMLElement;

    private readonly SCENE_TITLE_ID: string = "scene-title";
    private sceneTitleElement!: HTMLElement;

    private readonly SCENE_DESCRIPTION_ID: string = "scene-description";
    private sceneDescriptionElement!: HTMLElement;

    // Scene UIs
    private sceneUIs: any[] = [];
    private finishedInitializing: boolean = false;

    private currentMaxProgress: number = -1;

    constructor() {
        // Ensure singleton instance
        if (UIManager.instance) {
            throw new Error("UIManager is a singleton class and cannot be instantiated multiple times.");
        }
        UIManager.instance = this;

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            window.addEventListener("DOMContentLoaded", async () => {
                this.initializeReferences();
                this.initializeSceneUIs();
                this.listenForAudioPermissionRequest();                
            });
        } else {
            // DOM already loaded
            this.initializeReferences();
            this.initializeSceneUIs();
            this.listenForAudioPermissionRequest();
        }
    }

    /**
     * Listen for audio permission request from iframe
     */
    private listenForAudioPermissionRequest(): void {
        window.addEventListener("message", (event) => {
            if (event.data.type === "AUDIO_PERMISSION_NEEDED") {
                this.showAudioPermissionPrompt();
            } else if (event.data.type === "PLAY_AUDIO") {
                // Forward play audio message to the current scene iframe
                const currentIframe = document.getElementById(`scene-${SceneManager.INSTANCE.CURRENT_SCENE_INDEX}-iframe`) as HTMLIFrameElement;
                if (currentIframe && currentIframe.contentWindow) {
                    currentIframe.contentWindow.postMessage({ type: "PLAY_AUDIO" }, "*");
                }
            }
        });
    }

    /**
     * Show audio permission prompt overlay
     */
    private showAudioPermissionPrompt(): void {
        const overlay = document.getElementById("audio-permission-overlay");
        if (overlay) {
            overlay.style.display = "flex";
        }
    }

    /**
     * Hide audio permission prompt overlay
     */
    public hideAudioPermissionPrompt(): void {
        const overlay = document.getElementById("audio-permission-overlay");
        if (overlay) {
            overlay.style.display = "none";
        }
    }

    /**
     * Initialize html element references
     */
    private initializeReferences(): void {
        this.directoryElement = document.getElementById(this.DIRECTORY_ID)!;
        this.progressBarFillElement = document.getElementById(this.PROGRESS_BAR_FILL_ID)!;
        this.sceneTitleElement = document.getElementById(this.SCENE_TITLE_ID)!;
        this.sceneDescriptionElement = document.getElementById(this.SCENE_DESCRIPTION_ID)!;
    }

    /**
     * Initialize the main UI DOM Components.
     */
    private async initializeSceneUIs(): Promise<void> {
        // Get a list of directory items.
        const directoryItems = await SceneManager.INSTANCE.getAllSceneUIInformations();
        
        // Store scene UI data
        this.sceneUIs = directoryItems;

        // Populate the directory UI
        directoryItems.forEach((item, index) => {
            const listItem = document.createElement("li");
            listItem.classList.add("directory-current");
            listItem.textContent = `${index}: ${item.directoryHeader}`;
            this.directoryElement.appendChild(listItem);
        });

        this.finishedInitializing = true;
    }

    /**
     * Wait for UIManager to finish initialization
     */
    public async waitForInitialization(): Promise<void> {
        while (!this.finishedInitializing) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    /**
     * Triggered when the scene is changed.
     */
    public async sceneChanged(): Promise<void> {        
        const sceneIndex = SceneManager.INSTANCE.CURRENT_SCENE_INDEX;
        this.setSceneTitleAndDescription(sceneIndex);
    }

    /**
     * Update the scene title and description in the UI.
     */
    private setSceneTitleAndDescription(sceneIndex: number): void {
        if (sceneIndex < 0 || sceneIndex >= this.sceneUIs.length) {
            console.error(`Invalid scene index: ${sceneIndex}`);
            return;
        }

        // Get and set the scene UI information
        const sceneUI = this.sceneUIs[sceneIndex];
        this.sceneTitleElement.textContent = `${sceneUI.sceneName}`;
        this.sceneDescriptionElement.textContent = sceneUI.description;
        this.currentMaxProgress = sceneUI.maxProgress;
    }

    /**
     * Get the current scene's max progress value
     */
    public getCurrentSceneMaxProgress(): number {
        if (this.currentMaxProgress < 0) {
            console.warn("getCurrentSceneMaxProgress called before scene is loaded");
            return 0;
        }
        return this.currentMaxProgress;
    }

    /**
     * Set the progress bar value.
     * @param animate If true, animates the progress bar transition. If false, updates instantly.
     */
    public setProgressBarValue(value: number, maxValue: number, animate: boolean = true): void
    {
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        if (animate) {
            this.progressBarFillElement.style.transition = 'width 0.3s ease';
        } else {
            this.progressBarFillElement.style.transition = 'none';
        }
        
        this.progressBarFillElement.style.width = `${percentage}%`;
    }
}