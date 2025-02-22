import { openai } from "@ai-sdk/openai";
import { Mastra } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { Step, Workflow } from "@mastra/core/workflows";
import { z } from "zod";

// ── 개별 평가 에이전트용 평가 지침 (5-tier scale) ──
export const samEvaluationInstructions = `
[SamEvaluationAgent]
You are an evaluation agent representing Sam Sklar, a data-driven marketer with extensive experience in B2B SaaS and AI, leading Product-Led Growth strategies.
Evaluate the candidate's performance in the phone interview transcript below based on the following company principles:
1. First principles – Approach the problem without bias; find the best solution from the basics.
2. Excellence everywhere – Strive to lead in every aspect, from technical skills to community engagement.
3. Owning outcomes – Take responsibility for your work and consider its impact.
Rate the candidate on a 5-tier scale: (Strong Inclined, Inclined, Neutral, Concern, Strong Concern)
Provide specific examples and evidence.
Transcript:
`;

export const piotrEvaluationInstructions = `
[PiotrEvaluationAgent]
You are an evaluation agent representing Piotr Dabkowski, a technical innovator and AI expert.
Evaluate the candidate's performance in the phone interview transcript below based on technical depth, problem-solving, and responsible AI development.
Follow these principles:
1. First principles – Approach problems from the basics.
2. Excellence everywhere – Strive for leadership in all aspects.
3. Owning outcomes – Accept responsibility and consider impact.
Rate the candidate on a 5-tier scale: (Strong Inclined, Inclined, Neutral, Concern, Strong Concern)
Support your rating with specific examples and evidence.
Transcript:
`;

export const matiEvaluationInstructions = `
[MatiEvaluationAgent]
You are an evaluation agent representing Mati Staniszewski, a visionary entrepreneur focused on transformative AI voice technology and sustainable global scaling.
Evaluate the candidate's performance in the phone interview transcript below, emphasizing strategic vision, innovation, and sustainability.
Apply these principles:
1. First principles – Approach issues without bias.
2. Excellence everywhere – Aim to lead in every domain.
3. Owning outcomes – Demonstrate responsibility and consider impact.
Rate the candidate on a 5-tier scale: (Strong Inclined, Inclined, Neutral, Concern, Strong Concern)
Provide specific examples and evidence.
Transcript:
`;

// ── 개별 평가 에이전트 생성 ──
export const samAgent = new Agent({
    name: "SamEvaluationAgent",
    instructions: samEvaluationInstructions,
    model: openai("gpt-4o-mini"),
});

export const piotrAgent = new Agent({
    name: "PiotrEvaluationAgent",
    instructions: piotrEvaluationInstructions,
    model: openai("gpt-4o-mini"),
});

export const matiAgent = new Agent({
    name: "MatiEvaluationAgent",
    instructions: matiEvaluationInstructions,
    model: openai("gpt-4o-mini"),
});

// ── 중재자(오케스트레이션) 에이전트 (협업 시 binary 평가로 전환) ──
export const mediatorInstructions = `
You are the MediatorAgent tasked with simulating a collaborative discussion among three evaluation agents who have reviewed a candidate's phone interview transcript.
Below are the individual evaluation outputs (each on a 5-tier scale):
-----------------------------------------------------------
Sam's Evaluation:
{{samEvaluation}}

Piotr's Evaluation:
{{piotrEvaluation}}

Mati's Evaluation:
{{matiEvaluation}}
-----------------------------------------------------------
For the purpose of the collaborative discussion, please convert each evaluation into a binary outcome:
- "Inclined" if the overall sentiment is positive (e.g., Strong Inclined, Inclined)
- "Not Inclined" if there are significant concerns (e.g., Concern, Strong Concern)
- If the evaluation is Neutral, decide based on supporting evidence.
Now, simulate a conversation as if the agents were in a meeting:
- Each agent should speak in turns, e.g., "Sam:", "Piotr:", "Mati:".
- Discuss similarities and differences in their binary evaluations.
- Address any discrepancies and elaborate on key points.
Finally, produce a final consensus evaluation report with these sections:
• Strengths: Summarize the candidate's key strengths with examples.
• Weaknesses: Outline concerns or areas for improvement.
• Final Evaluation Summary: State the overall evaluation as either "Inclined" or "Not Inclined" with supporting rationale.
Present both the conversation transcript and the final consensus report.
`;

export const mediatorAgent = new Agent({
    name: "MediatorAgent",
    instructions: mediatorInstructions,
    model: openai("gpt-4o-mini"),
});

// ── 평가 단계 (Step) 정의 ──

// Sam 평가 단계
export const evaluateSamStep = new Step({
    id: "evaluateSam",
    execute: async ({context}) => {
        const transcript = context.triggerData.transcript;
        if (!transcript) {
            throw new Error("Transcript is missing in trigger data.");
        }
        const prompt = samEvaluationInstructions + transcript;
        const result = await samAgent.generate(prompt);
        console.log("Sam Evaluation Result:", result.text);
        return {samEvaluation: result.text};
    },
});

// Piotr 평가 단계
export const evaluatePiotrStep = new Step({
    id: "evaluatePiotr",
    execute: async ({context}) => {
        const transcript = context.triggerData.transcript;
        if (!transcript) {
            throw new Error("Transcript is missing in trigger data.");
        }
        const prompt = piotrEvaluationInstructions + transcript;
        const result = await piotrAgent.generate(prompt);
        console.log("Piotr Evaluation Result:", result.text);
        return {piotrEvaluation: result.text};
    },
});

// Mati 평가 단계
export const evaluateMatiStep = new Step({
    id: "evaluateMati",
    execute: async ({context}) => {
        const transcript = context.triggerData.transcript;
        if (!transcript) {
            throw new Error("Transcript is missing in trigger data.");
        }
        const prompt = matiEvaluationInstructions + transcript;
        const result = await matiAgent.generate(prompt);
        console.log("Mati Evaluation Result:", result.text);
        return {matiEvaluation: result.text};
    },
});

// 중재자 대화 시뮬레이션 단계 (협업: 평가를 binary로 변환하여 토론)
export const mediatorStep = new Step({
    id: "mediatorStep",
    execute: async ({context}) => {
        const samEvaluation = context.getStepPayload("evaluateSam").samEvaluation;
        const piotrEvaluation = context.getStepPayload("evaluatePiotr").piotrEvaluation;
        const matiEvaluation = context.getStepPayload("evaluateMati").matiEvaluation;

        const prompt = mediatorInstructions
            .replace("{{samEvaluation}}", samEvaluation)
            .replace("{{piotrEvaluation}}", piotrEvaluation)
            .replace("{{matiEvaluation}}", matiEvaluation);

        const result = await mediatorAgent.generate(prompt);
        console.log("Mediator Conversation & Consensus:", result.text);
        return {consensusEvaluation: result.text};
    },
});

// ── 워크플로우 구성 ──
export const evaluationWorkflow = new Workflow({
    name: "collaborativeDiscussionWorkflow",
    triggerSchema: z.object({
        transcript: z.string().describe("Complete phone interview transcript"),
    }),
})
    .step(evaluateSamStep)
    .then(evaluatePiotrStep)
    .then(evaluateMatiStep)
    .then(mediatorStep)
    .commit();

// ── Mastra 인스턴스 생성 ──
export const mastra = new Mastra({
    workflows: {
        collaborativeDiscussionWorkflow: evaluationWorkflow,
    },
});

// ── 워크플로우 실행 예시 ──
export async function main() {
    // 실제 전화면접 대화 내역을 transcript 변수에 할당합니다.
    const transcript = `
  [전화면접 대화 내역 전체 예시]
  Interviewer: 질문 내용...
  Candidate: 답변 내용...
  ...
  `;

    const {start} = evaluationWorkflow.createRun();
    const result = await start({
        triggerData: {transcript},
    });
    console.log("최종 공동 평가 결과 (대화 시뮬레이션 포함):", result.results);
}
