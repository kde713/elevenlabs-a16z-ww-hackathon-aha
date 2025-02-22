'use client';

import {Button, cn, Radio, RadioGroup, RadioProps, Select, SelectItem} from "@heroui/react";
import {PropsWithChildren, useState} from "react";

const CustomRadio = (props: PropsWithChildren<RadioProps>) => {
    const {children, ...otherProps} = props;

    return (
        <Radio
            {...otherProps}
            classNames={{
                base: cn(
                    "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                    "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
                    "data-[selected=true]:border-primary",
                ),
            }}
        >
            {children}
        </Radio>
    );
};

export default function Page() {
    const [ step, setStep ] = useState(1);
    const [ template, setTemplate ] = useState<string>('');
    const [ interviewId, setInterviewId ] = useState<string>('');

    const moveStep2 = () => {
        if (step !== 1) return;
        setStep(2);
    }

    const submit = async () => {
        if (step !== 2) return;
        await (new Promise(resolve => setTimeout(resolve, 2000)));
        setInterviewId(crypto.randomUUID().replace(/-/g, ''))
        setStep(3);
    }

    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center">
                {(step === 1) && (
                    <>
                        <h3>Select your principle template.</h3>
                        <RadioGroup
                            value={template}
                            onChange={(e) => setTemplate(e.currentTarget.value)}
                        >
                            <CustomRadio
                                value="elevenlabs"
                                description={
                                    <ol>
                                        <li>First principles</li>
                                        <li>Excellence everywhere</li>
                                        <li>Owning outcomes</li>
                                    </ol>
                                }
                            >
                                ElevenLabs
                            </CustomRadio>
                            <CustomRadio
                                value="netflix"
                                description={
                                    <ol>
                                        <li>The Dream Team</li>
                                        <li>People over Process</li>
                                        <li>Uncomfortably Exciting</li>
                                        <li>Great and Always Better</li>
                                    </ol>
                                }
                            >
                                Netflix
                            </CustomRadio>
                            <CustomRadio
                                value="custom"
                                description={
                                    "Start by interview with our expert AI Recruiting Assistant."
                                }
                            >
                                Customize
                            </CustomRadio>
                        </RadioGroup>
                        <Button className="w-full" color="primary" type="button" onPress={moveStep2}>
                            Next
                        </Button>
                    </>
                )}
                {(step === 2) && (
                    <>
                        <h3>Select your position and candidate.</h3>
                        <Select
                            className="max-w-xs"
                            disabledKeys={["zebra", "tiger", "lion", "elephant", "crocodile", "whale"]}
                            label="Position"
                            placeholder="Select a hiring position"
                        >
                            <SelectItem>Growth Marketer / German</SelectItem>
                        </Select>
                        <Select
                            className="max-w-xs"
                            disabledKeys={["zebra", "tiger", "lion", "elephant", "crocodile", "whale"]}
                            label="Candidate"
                            placeholder="Select a candidate"
                        >
                            <SelectItem>Mike Lee</SelectItem>
                        </Select>
                        <Button className="w-full" color="primary" type="button" onPress={submit}>
                            Next
                        </Button>
                    </>
                )}
                {(step === 3) && (
                    <>
                        <h3>Share this link to candidate.</h3>
                        <p>https://aha-interview-ui.vercel.app/?session={interviewId}</p>
                    </>
                )}
            </main>
        </div>
    );
}
