import {
    MinimalCard,
    MinimalCardDescription,
    MinimalCardImage,
    MinimalCardTitle,
  } from "@/components/ui/minimal-card"

  export function MinimalCardDemo() {
    const cards = [
      {
        title: "Generate PPT",
        description:
          "Create stunning presentations instantly. From business pitches to educational slides - just describe your content and watch it come to life.",
        src: "https://36qnrr0vnr.ufs.sh/f/IU6ZTbnkqLizVS6KIos3jQM7WcduKztmEP8CwX6U1qeIhgFi",
        isVideo: true,
      },
      {
        title: "Generate Image",
        description:
          "Turn your ideas into visuals in seconds. Generate custom images, illustrations, and graphics that perfectly match your vision.",
        src: "https://36qnrr0vnr.ufs.sh/f/IU6ZTbnkqLizcTuMNHz0v1kRHOmdP4ZuWsMoyKDFilaXjSwV",
        isVideo: true,
      },
    ]
    return (
      <div className="w-full max-w-5xl ">
        <div className="flex flex-col justify-center rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-center ">
            {cards.map((card, index) => (
              <MinimalCard className="m-2 w-[460px] " key={index}>
                <MinimalCardImage
                  className="h-[320px]"
                  src={card.src}
                  alt={card.title}
                  isVideo={card.isVideo}
                />
                <MinimalCardTitle>{card.title}</MinimalCardTitle>
                <MinimalCardDescription>
                  {card.description}
                </MinimalCardDescription>
              </MinimalCard>
            ))}
          </div>
        </div>
      </div>
    )
  }