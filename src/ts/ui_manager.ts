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

    constructor() {
        // Ensure singleton instance
        if (UIManager.instance) {
            throw new Error("UIManager is a singleton class and cannot be instantiated multiple times.");
        }
        UIManager.instance = this;

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            window.addEventListener("DOMContentLoaded", () => {
                this.initializeReferences();
                this.initializeSceneUIs();
            });
        } else {
            // DOM already loaded
            this.initializeReferences();
            this.initializeSceneUIs();
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
    }

    /**
     * Triggered when the scene is changed.
     */
    public sceneChanged(): void {
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
    }


    /**
     * Set the progress bar value.
     */
    private setProgressBarValue(value: number, maxValue: number)
    {
        const percentage = (value / maxValue) * 100;
        console.log(`Setting progress bar to ${percentage}%`);
        this.progressBarFillElement.style.width = `${percentage}%`;
    }
}