import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { callOpenAI } from "@/utils/openai";

export default function Projects() {
  const [projectInput, setProjectInput] = useState({
    name: "",
    description: "",
    goals: "",
    targetAudience: "",
    budget: "",
    timeline: ""
  });
  const [proposal, setProposal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectInput(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateProposal = async () => {
    setIsLoading(true);
    try {
      const prompt = `Generate a comprehensive business proposal based on the following project details:

Project Name: ${projectInput.name}
Description: ${projectInput.description}
Goals: ${projectInput.goals}
Target Audience: ${projectInput.targetAudience}
Budget: ${projectInput.budget}
Timeline: ${projectInput.timeline}

Please create a detailed business proposal with the following sections:
1. Executive Summary
2. Project Overview
3. Goals and Objectives
4. Target Market Analysis
5. Project Scope and Deliverables
6. Methodology and Approach
7. Timeline and Milestones
8. Budget Breakdown
9. Risk Assessment and Mitigation
10. Team Structure and Responsibilities
11. Marketing and Promotion Strategy
12. Success Metrics and KPIs
13. Conclusion and Next Steps

Provide detailed content for each section, ensuring the proposal is comprehensive and tailored to the specific project details provided.`;

      const response = await callOpenAI(prompt);
      setProposal(response);
    } catch (error) {
      console.error("Error generating proposal:", error);
      alert(`Failed to generate proposal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Business Project Proposal Generator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
          <Input
            placeholder="Project Name"
            name="name"
            value={projectInput.name}
            onChange={handleInputChange}
            className="mb-4"
          />
          <Textarea
            placeholder="Project Description"
            name="description"
            value={projectInput.description}
            onChange={handleInputChange}
            className="mb-4"
            rows={4}
          />
          <Textarea
            placeholder="Project Goals"
            name="goals"
            value={projectInput.goals}
            onChange={handleInputChange}
            className="mb-4"
            rows={4}
          />
          <Input
            placeholder="Target Audience"
            name="targetAudience"
            value={projectInput.targetAudience}
            onChange={handleInputChange}
            className="mb-4"
          />
          <Input
            placeholder="Budget"
            name="budget"
            value={projectInput.budget}
            onChange={handleInputChange}
            className="mb-4"
          />
          <Input
            placeholder="Timeline"
            name="timeline"
            value={projectInput.timeline}
            onChange={handleInputChange}
            className="mb-4"
          />
          <Button 
            onClick={handleGenerateProposal} 
            disabled={isLoading || Object.values(projectInput).some(value => !value.trim())}
          >
            {isLoading ? "Generating..." : "Generate Business Proposal"}
          </Button>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Generated Business Proposal</h2>
          <Card className="h-[calc(100vh-200px)] overflow-auto">
            <CardContent>
              {proposal ? (
                <pre className="whitespace-pre-wrap">{proposal}</pre>
              ) : (
                <p className="text-gray-500">Your generated proposal will appear here.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}