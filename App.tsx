
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import VisualizationPanel from './components/VisualizationPanel';
import SolutionPanel from './components/SolutionPanel';
import { solveProblem } from './services/geminiService';
import type { GeometrySolution, ProblemInput, Parameter } from './types';

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [solution, setSolution] = useState<GeometrySolution | null>(null);
  const [parameterValues, setParameterValues] = useState<{ [key: string]: number }>({});
  const [lastInput, setLastInput] = useState<ProblemInput | null>(null);

  const handleParameterChange = useCallback((name: string, value: number) => {
    setParameterValues(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const resetSolution = () => {
    setSolution(null);
    setError(null);
    setParameterValues({});
  };

  const handleSubmit = useCallback(async (input: ProblemInput) => {
    setLastInput(input);
    resetSolution();
    setIsLoading(true);

    try {
      const result = await solveProblem(input);
      setSolution(result);
      // Initialize parameter values from the solution
      const initialParams: { [key: string]: number } = {};
      result.parameters.forEach(p => {
        initialParams[p.name] = p.defaultValue;
      });
      setParameterValues(initialParams);

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRedraw = useCallback(async () => {
    if (lastInput && !isLoading) {
      await handleSubmit(lastInput);
    }
  }, [lastInput, isLoading, handleSubmit]);

  const handleFollowUpSubmit = useCallback(async (followUpText: string) => {
    if (lastInput && !isLoading && followUpText.trim()) {
      // If the original input was only an image, the text would be undefined.
      const originalText = lastInput.text || `Phân tích hình ảnh được cung cấp.`;
      const newText = `${originalText}\n\n---\nYêu cầu bổ sung:\n${followUpText}`;
      
      const newInput: ProblemInput = {
        ...lastInput,
        text: newText,
      };
      await handleSubmit(newInput);
    }
  }, [lastInput, isLoading, handleSubmit]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 lg:p-6 flex flex-col gap-6">
        
        {/* Input Panel at the top */}
        <InputPanel onSubmit={handleSubmit} isLoading={isLoading} />

        {/* Visualization and Solution panels below in a grid, only shown after submit */}
        {(isLoading || error || solution) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VisualizationPanel 
                  solution={solution}
                  isLoading={isLoading}
                  error={error}
                  parameterValues={parameterValues}
                  onParameterChange={handleParameterChange}
                  onRedraw={handleRedraw}
                  onFollowUpSubmit={handleFollowUpSubmit}
                />
                {solution && <SolutionPanel solution={solution} />}
            </div>
        )}

      </main>
    </div>
  );
}
