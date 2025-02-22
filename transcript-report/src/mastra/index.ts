import { Mastra } from "@mastra/core";
import { evaluationWorkflow, matiAgent, mediatorAgent, piotrAgent, samAgent } from "./mycode/play";

// Mastra 인스턴스 생성
export const mastra = new Mastra({
    agents: {
        samAgent,
        piotrAgent,
        matiAgent,
        mediatorAgent,
    },
    workflows: {
        evaluationWorkflow,
    },
});
