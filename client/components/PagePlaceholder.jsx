import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Construction, ArrowRight } from "lucide-react";

const PagePlaceholder = ({
  title,
  description,
  features,
  comingSoon = true,
}) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        <Card>
          <CardHeader className="pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Construction className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {features && features.length > 0 && (
              <div className="text-left">
                <h3 className="font-semibold mb-3">Planned Features:</h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-sm text-muted-foreground"
                    >
                      <ArrowRight className="h-3 w-3 mr-2 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {comingSoon && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  🚧 This page is under development. Continue prompting to help
                  build out this section!
                </p>
              </div>
            )}

            <div className="pt-4">
              <Button variant="outline" className="w-full">
                Request This Feature
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PagePlaceholder;
