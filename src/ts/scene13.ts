/**
 * Start Menu
 */
class Scene13 extends Scene {
    protected directoryHeader: string = "Summary";
    protected sceneName: string = "What have we learned today?";

    protected sceneObjectives: { [key: string]: boolean } = {
        "narration-complete": false,
    }

    protected startScene(): void {
        this.audioPlayer.play();
    }

    constructor() {
        super();

        // Set max progress
        this.maxProgress = Object.keys(this.sceneObjectives).length;

        const infoBox1 = document.getElementById("info-box-1")!;
        const infoBox2 = document.getElementById("info-box-2")!;
        const infoBox3 = document.getElementById("info-box-3")!;

        this.audioPlayer.setAudioElement(
            "initial-narration", 
            [
                {
                    timestamp: 0.5,
                    callback: () => {
                        infoBox1.classList.add("visible");
                    },
                },
                {
                    timestamp: 5.0,
                    callback: () => {
                        infoBox2.classList.add("visible");
                    },
                },
                {
                    timestamp: 10.0,
                    callback: () => {
                        infoBox3.classList.add("visible");
                    },
                },
            ],
            () => {
                this.updateObjectivesAndProgress("narration-complete");
            }
        )
    }
}

// Initialize the scene
new Scene13();