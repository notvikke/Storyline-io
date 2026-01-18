import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Bug, Lightbulb, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface FeedbackModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    defaultTab?: "bug" | "feature";
}

export function FeedbackModal({ isOpen, onOpenChange, defaultTab = "bug" }: FeedbackModalProps) {
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<string>(defaultTab);

    // Update active tab when defaultTab changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setActiveTab(defaultTab);
            setIsSuccess(false);
            setMessage("");
        }
    }, [isOpen, defaultTab]);

    const handleSubmit = async () => {
        if (!message.trim()) return;

        setIsSubmitting(true);

        const { error } = await (supabase
            .from("app_feedback") as any)
            .insert({
                type: activeTab === "bug" ? "bug" : "feature_request",
                message: message,
            });

        setIsSubmitting(false);

        if (error) {
            console.error(error);
            return;
        }

        setIsSuccess(true);
        setTimeout(() => {
            onOpenChange(false);
        }, 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <AnimatePresence mode="wait">
                    {isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-10 text-center"
                            key="success"
                        >
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                <Check className="w-8 h-8 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                            <p className="text-muted-foreground">
                                Your feedback has been received.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key="form"
                        >
                            <DialogHeader>
                                <DialogTitle>Send Feedback</DialogTitle>
                                <DialogDescription>
                                    Help us improve Storyline by reporting bugs or requesting new features.
                                </DialogDescription>
                            </DialogHeader>

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="bug" className="gap-2">
                                        <Bug size={16} /> Report Bug
                                    </TabsTrigger>
                                    <TabsTrigger value="feature" className="gap-2">
                                        <Lightbulb size={16} /> Request Feature
                                    </TabsTrigger>
                                </TabsList>
                                <div className="mt-4 space-y-4">
                                    <Textarea
                                        placeholder={
                                            activeTab === "bug"
                                                ? "Describe the bug you encountered..."
                                                : "What feature would you like to see?"
                                        }
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="min-h-[120px]"
                                    />
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !message.trim()}
                                        className={`w-full transition-colors duration-300 ${activeTab === "bug"
                                            ? "bg-red-500 hover:bg-red-600 text-white"
                                            : "bg-emerald-500 hover:bg-emerald-600 text-white"
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            "Submit Feedback"
                                        )}
                                    </Button>
                                </div>
                            </Tabs>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
