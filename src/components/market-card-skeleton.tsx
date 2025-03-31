import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

export function MarketCardSkeleton() {
    return (
        <Card className="flex flex-col h-full">
            <div className="animate-pulse">
                {/* Image placeholder */}
                <div className="w-full h-24 bg-gray-200"></div>
                
                <CardHeader className="p-3 pb-1.5">
                    <Badge 
                        variant="secondary" 
                        className="mb-2 bg-gray-200 h-3 w-1/3"
                    />
                    <CardTitle className="bg-gray-200 h-5 w-full" />
                </CardHeader>
                
                <CardContent className="px-3 py-1 flex-grow">
                    <div className="h-[110px] mb-2">
                        {/* Options placeholders */}
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between mb-3">
                                <span className="bg-gray-200 h-4 w-1/3" />
                                <div className="flex gap-2">
                                    <span className="bg-gray-200 h-4 w-8" />
                                    <span className="bg-gray-200 h-7 w-12 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                
                <CardFooter className="p-3 pt-1 border-t border-border/30">
                    <div className="w-full flex justify-start">
                        <span className="bg-gray-200 h-6 w-1/2 rounded-full" />
                    </div>
                </CardFooter>
            </div>
        </Card>
    );
}
