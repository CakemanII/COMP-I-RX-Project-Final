/**
 * Start Menu
 */
class Scene0 extends Scene {
    protected directoryHeader: string = "Welcome";
    protected sceneName: string = "Welcome to the Tampa Bay Rising Sea Levels Interactive Experience"

    protected sceneObjectives: { [key: string]: boolean } = {
        "main-narrator-completed": false,
    }

    constructor() {
        super();

        // Set max progress
        this.maxProgress = Object.keys(this.sceneObjectives).length;

        this.setupAudioPlaying();
        this.audioPlayer.play();
    }

    protected startScene(): void {
        this.audioPlayer.play();
    }

    /** 
     * Setup the audio to play after user interaction
     */
    private setupAudioPlaying(): void {
        // Get additional elements
        const infoBox1 = document.getElementById("info-box-1")!;
        const spaceBarImage = document.getElementById("space-bar-image")!;

        this.audioPlayer.setAudioElement(
            "initial-narration", 
            [
                {
                    timestamp: 9.5,
                    callback: () => {
                        infoBox1.classList.add("visible");
                    }
                },
                {
                    timestamp: 24.0,
                    callback: () => {
                        // image about tasks to do.
                    }
                },
                {
                    timestamp: 32.0,
                    callback: () => {
                        spaceBarImage.classList.add("visible");
                    }
                }
            ],
            () => {
                this.updateObjectivesAndProgress("main-narrator-completed");
            }
        )
    }
}

// Initialize the scene
new Scene0();