
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

interface RewardTierProps {
  title: string;
  pointsRequired: number;
  benefits: string[];
}

export function RewardTier({ title, pointsRequired, benefits }: RewardTierProps) {
  return (
    <Card className={`border-2 ${title === 'Gold' ? 'border-yellow-500' : 
                               title === 'Silver' ? 'border-gray-400' : 
                               'border-amber-700'}`}>
      <CardHeader className={`pb-2 ${title === 'Gold' ? 'bg-yellow-500/10' : 
                                   title === 'Silver' ? 'bg-gray-400/10' : 
                                   'bg-amber-700/10'}`}>
        <CardTitle className="text-center text-lg">{title} Tier</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center mb-4">
          <span className="text-3xl font-bold">{pointsRequired.toLocaleString()}</span>
          <span className="text-muted-foreground"> points</span>
        </div>
        
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <span className={`mr-2 mt-0.5 rounded-full p-1 
                ${title === 'Gold' ? 'bg-yellow-500/20 text-yellow-500' : 
                title === 'Silver' ? 'bg-gray-400/20 text-gray-400' : 
                'bg-amber-700/20 text-amber-700'}`}>
                <Check size={12} />
              </span>
              <span className="text-sm">{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
