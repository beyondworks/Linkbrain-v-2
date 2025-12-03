import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Folder, Plus } from 'lucide-react';
import CreateCollectionDialog from './CreateCollectionDialog';

interface SelectCollectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (collectionName: string) => void;
    collections: { id: string; name: string; color: string }[];
    onCreate: (data: { name: string; color: string }) => void;
    language?: 'KR' | 'EN';
}

const SelectCollectionDialog = ({
    isOpen,
    onClose,
    onSelect,
    collections,
    onCreate,
    language = 'KR'
}: SelectCollectionDialogProps) => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const handleSelectCollection = (collectionName: string) => {
        onSelect(collectionName);
        onClose();
    };

    const handleCreateNew = () => {
        setIsCreateDialogOpen(true);
    };

    const handleCreate = (data: { name: string; color: string }) => {
        onCreate(data);
        setIsCreateDialogOpen(false);
        // After creating, auto-select the new collection
        onSelect(data.name);
        onClose();
    };

    const handleClose = () => {
        // Small delay to prevent event bubbling
        setTimeout(() => {
            onClose();
        }, 0);
    };

    return (
        <>
            <Dialog
                open={isOpen}
                onOpenChange={(open: boolean) => {
                    if (!open) {
                        handleClose();
                    }
                }}
            >
                <DialogContent
                    className="sm:max-w-[425px] bg-white dark:bg-[#1e1e1e] text-[#3d3d3d] dark:text-white"
                    onPointerDownOutside={(e: Event) => e.preventDefault()}
                    onInteractOutside={(e: Event) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {language === 'KR' ? "컬렉션 선택" : "Select Collection"}
                        </DialogTitle>
                        <DialogDescription className="text-[#959595]">
                            {language === 'KR'
                                ? "클립을 저장할 컬렉션을 선택하세요."
                                : "Choose a collection to save this clip."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3 py-4 max-h-[400px] overflow-y-auto">
                        {/* Create New Collection Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCreateNew();
                            }}
                            className="flex items-center gap-3 w-full p-4 rounded-xl border-2 border-dashed border-[#21dba4] hover:bg-[#21dba4]/5 dark:hover:bg-[#21dba4]/10 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-[#21dba4]/10 dark:bg-[#21dba4]/20 flex items-center justify-center group-hover:bg-[#21dba4]/20 dark:group-hover:bg-[#21dba4]/30 transition-colors">
                                <Plus className="w-5 h-5 text-[#21dba4]" />
                            </div>
                            <span className="text-sm font-medium text-[#21dba4]">
                                {language === 'KR' ? "새 컬렉션 만들기" : "Create New Collection"}
                            </span>
                        </button>

                        {/* Collection List */}
                        {collections.length === 0 ? (
                            <div className="py-8 text-center text-[#959595] text-sm">
                                {language === 'KR'
                                    ? "아직 생성된 컬렉션이 없습니다."
                                    : "No collections yet."}
                            </div>
                        ) : (
                            collections.map((collection) => (
                                <button
                                    key={collection.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectCollection(collection.name);
                                    }}
                                    className="flex items-center gap-3 w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#21dba4] dark:hover:border-[#21dba4] hover:bg-gray-50 dark:hover:bg-[#252525] transition-all group"
                                >
                                    <div className={`w-10 h-10 rounded-lg ${collection.color} flex items-center justify-center`}>
                                        <Folder className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-[#3d3d3d] dark:text-white group-hover:text-[#21dba4] transition-colors">
                                        {collection.name}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                handleClose();
                            }}
                            className="border-none shadow-none hover:bg-gray-50 dark:hover:bg-[#252525] text-[#959595]"
                        >
                            {language === 'KR' ? "취소" : "Cancel"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create Collection Dialog */}
            <CreateCollectionDialog
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onCreate={handleCreate}
                language={language}
            />
        </>
    );
};

export default SelectCollectionDialog;
