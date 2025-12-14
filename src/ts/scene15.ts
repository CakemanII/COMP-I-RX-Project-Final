/**
 * Start Menu
 */
class Scene15 extends Scene {
    protected directoryHeader: string = "Sources & Credits";
    protected sceneName: string = "References and Credits";

    protected sceneObjectives: { [key: string]: boolean } = {
        "done": false,
    }

    protected startScene(): void {
        this.updateObjectivesAndProgress("done");
    }

    constructor() {
        super();

        // Set max progress
        this.maxProgress = Object.keys(this.sceneObjectives).length;
    }
}

// Initialize the scene
new Scene15();