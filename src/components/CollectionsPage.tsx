import React, { useState } from 'react';
import CollectionCard from './CollectionCard';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface CollectionsPageProps {
    onCollectionClick: (collection: any) => void;
    onCreateClick: () => void;
    onBack?: () => void;
    language?: 'KR' | 'EN';
    user?: any;
}

const CollectionsPage = ({ onCollectionClick, onCreateClick, onBack, language = 'KR', user }: CollectionsPageProps) => {
    const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [collectionToDelete, setCollectionToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [collections, setCollections] = useState<any[]>([]);

    React.useEffect(() => {
        if (!user) {
            setCollections([]);
            return;
        }

        const q = query(
            collection(db, 'collections'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                count: 0, // You might need to calculate this from clips or store it
                updatedAt: doc.data().createdAt?.toDate().toLocaleDateString() || 'Just now'
            }));
            setCollections(fetched);
        });

        return () => unsubscribe();
    }, [user]);

    const sortedCollections = [...collections].sort((a, b) => {
        // Sort locally
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;

        if (sortOrder === 'recent') {
            return dateB - dateA;
        } else {
            return dateA - dateB;
        }
    });

    const handleDeleteClick = (collection: any) => {
        setCollectionToDelete(collection);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!collectionToDelete) return;
        setIsDeleting(true);
        try {
            const collectionName = collectionToDelete.name;
            await deleteDoc(doc(db, 'collections', collectionToDelete.id));
            setIsDeleteDialogOpen(false);
            setCollectionToDelete(null);

            toast.success(language === 'KR' ? "컬렉션이 삭제되었습니다" : "Collection deleted successfully", {
                description: language === 'KR'
                    ? `"${collectionName}"이(가) 삭제되었습니다`
                    : `"${collectionName}" has been deleted`,
            });
        } catch (error) {
            console.error("Error deleting collection:", error);
            toast.error(language === 'KR' ? "삭제 중 오류가 발생했습니다" : "Error deleting collection", {
                description: language === 'KR'
                    ? "다시 시도해주세요"
                    : "Please try again",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="w-full px-6 md:px-10 pb-20 pt-8">

            {/* Header Section with Back Button */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-[#959595]" />
                        </button>
                    )}
                    <h2 className="text-[#3d3d3d] dark:text-white text-[28px] font-bold">
                        {language === 'KR' ? "컬렉션" : "Collections"}
                    </h2>
                </div>

                {/* Sort / Filter */}
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-[#E0E0E0] dark:border-gray-800 rounded-[12px] text-[#959595] text-[14px] hover:border-[#21DBA4] hover:text-[#21DBA4] transition-colors focus:outline-none">
                            <span>{sortOrder === 'recent' ? (language === 'KR' ? '최신순' : 'Recent') : (language === 'KR' ? '오래된순' : 'Oldest')}</span>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32 bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg p-1">
                            <DropdownMenuItem
                                className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2 focus:text-[#21dba4]"
                                onClick={() => setSortOrder('recent')}
                            >
                                {language === 'KR' ? '최신순' : 'Recent'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525] text-sm text-gray-600 dark:text-gray-300 px-3 py-2 focus:text-[#21dba4]"
                                onClick={() => setSortOrder('oldest')}
                            >
                                {language === 'KR' ? '오래된순' : 'Oldest'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {/* Create New Card */}
                <button
                    onClick={onCreateClick}
                    className="w-full h-[180px] border-2 border-dashed border-[#E0E0E0] dark:border-gray-800 rounded-[24px] flex flex-col items-center justify-center gap-3 hover:border-[#21DBA4] hover:bg-[#F9F9F9] dark:hover:bg-[#252525] transition-all group cursor-pointer"
                >
                    <div className="w-[48px] h-[48px] rounded-full bg-[#F5F5F5] dark:bg-[#252525] flex items-center justify-center group-hover:bg-[#21DBA4] transition-colors">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 4V16M4 10H16" stroke="#959595" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white transition-colors" />
                        </svg>
                    </div>
                    <span className="text-[#959595] font-medium group-hover:text-[#21DBA4] transition-colors">
                        {language === 'KR' ? "새 컬렉션 만들기" : "Create New"}
                    </span>
                </button>

                {/* Collection Cards */}
                {sortedCollections.map((col) => (
                    <div key={col.id} onClick={() => onCollectionClick(col)}>
                        <CollectionCard
                            name={col.name}
                            count={col.count}
                            updatedAt={col.updatedAt}
                            color={col.color}
                            onDelete={() => handleDeleteClick(col)}
                            language={language}
                        />
                    </div>
                ))}
            </div>

            <DeleteConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title={language === 'KR' ? "컬렉션 삭제" : "Delete Collection"}
                descriptionLines={language === 'KR'
                    ? [`"${collectionToDelete?.name}" 컬렉션을 삭제하시겠습니까?`, "이 작업은 되돌릴 수 없습니다."]
                    : [`Are you sure you want to delete "${collectionToDelete?.name}"?`, "This action cannot be undone."]}
                isLoading={isDeleting}
                language={language}
            />
        </div>
    );
};

export default CollectionsPage;
