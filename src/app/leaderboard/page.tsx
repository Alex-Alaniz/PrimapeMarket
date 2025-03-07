'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Leaderboard } from "@/components/leaderboard";

export default function LeaderboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container py-4">
        <Navbar />

        <div className="mt-8">
          <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
          <Leaderboard />
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}