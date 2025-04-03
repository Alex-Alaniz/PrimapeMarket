import { NextResponse } from 'next/server';

// Simplified creators route that always works without DB dependencies
export async function GET() {
  try {
    // Hardcoded creators data for guaranteed uptime
    const creators = [
      {
        id: "PrimapeMarkets",
        handle: "@PrimapeMarkets",
        name: "PRIMAPE",
        points: 690,
        category: "News",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "1788583582811766785",
        description: "The premier prediction market platform on ApeChain",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "AlexDotEth",
        handle: "@AlexDotEth",
        name: "Alex",
        points: 500,
        category: "Spaces",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "ApeChain Developer",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "apecoin",
        handle: "@apecoin",
        name: "ApeCoin",
        points: 250,
        category: "News",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "An awesome ApeChain creator building the future of Web3 social engagement.",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "ApeChainHUB",
        handle: "@ApeChainHUB",
        name: "ApeChain HUB",
        points: 250,
        category: "News",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "An awesome ApeChain creator building the future of Web3 social engagement.",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "ApewhaleNFT",
        handle: "@ApewhaleNFT",
        name: "ApeWhale",
        points: 250,
        category: "Spaces",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "An awesome ApeChain creator building the future of Web3 social engagement.",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "boringmerch",
        handle: "@boringmerch",
        name: "Boring Merch",
        points: 250,
        category: "News",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "An awesome ApeChain creator building the future of Web3 social engagement.",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "BoredApeYC",
        handle: "@BoredApeYC",
        name: "Bored Ape Yacht Club",
        points: 250,
        category: "News",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "An awesome ApeChain creator building the future of Web3 social engagement.",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "yugalabs",
        handle: "@yugalabs",
        name: "Yuga Labs",
        points: 250,
        category: "News",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "An awesome ApeChain creator building the future of Web3 social engagement.",
        avatar: "/images/pm.PNG",
        claimed: false
      }
    ];

    return NextResponse.json(creators);
  } catch (error) {
    console.error("Error in simplified creators API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch creators" },
      { status: 500 }
    );
  }
}