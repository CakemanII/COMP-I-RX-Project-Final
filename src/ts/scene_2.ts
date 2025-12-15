/**
 * Start Menu
 */
class Scene2 extends Scene {
    protected directoryHeader: string = "Ecosystems";
    protected sceneName: string = "Ecosystems in the Tampa Bay"

    protected sceneObjectives: { [key: string]: boolean } = {
        "narration-completed": false,
    }

    constructor() {
        super();

        // Set max progress
        this.maxProgress = Object.keys(this.sceneObjectives).length;

        console.log("Scene2 initialized");
        this.setupAudioPlaying();
    }

    protected startScene(): void { this.audioPlayer.play(); }

    private setupAudioPlaying(): void {
        const infoBox1 = document.getElementById("info-box-1")!;
        const imageBox1 = document.getElementById("alligator-image")!;
        const imageBox2 = document.getElementById("pig-image")!;
        const imageBox3 = document.getElementById("manatee-image")!;

        this.audioPlayer.setAudioElement(
            "initial-narration", 
            [
                {
                    timestamp: 8.0,
                    callback: () => {
                        infoBox1.classList.add("visible");
                    }
                },
                {
                    timestamp: 18.5,
                    callback: () => {
                        imageBox3.classList.add("visible");
                    }
                },
                {
                    timestamp: 20.0,
                    callback: () => {
                        // Show info box
                        imageBox1.classList.add("visible");
                    }
                },
                {
                    timestamp: 22.0,
                    callback: () => {
                        // Show info box
                        imageBox2.classList.add("visible");
                    }
                }
            ],
            () => {
                this.updateObjectivesAndProgress("narration-completed");
            }
        )
    }
}

// Initialize the scene
new Scene2();