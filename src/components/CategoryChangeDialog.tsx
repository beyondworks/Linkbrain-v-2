import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Check, Tag, Trash2, Pencil, X } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { getCategoryColor } from '../lib/categoryColors';

interface CategoryChangeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    clipId: string;
    currentCategory: string;
    language: 'KR' | 'EN';
}

const PRESET_COLORS = [
    { bg: 'bg-[#E8E8E8]', text: 'text-[#5A5A5A]', hex: '#E8E8E8' },
    { bg: 'bg-[#E0D5CA]', text: 'text-[#6B5A47]', hex: '#E0D5CA' },
    { bg: 'bg-[#FCDDC4]', text: 'text-[#C77844]', hex: '#FCDDC4' },
    { bg: 'bg-[#F9EAC8]', text: 'text-[#B08B3A]', hex: '#F9EAC8' },
    { bg: 'bg-[#D4E9D4]', text: 'text-[#5B8C5B]', hex: '#D4E9D4' },
    { bg: 'bg-[#D1E7F0]', text: 'text-[#5B8DAF]', hex: '#D1E7F0' },
    { bg: 'bg-[#E3D9EC]', text: 'text-[#8B6B9E]', hex: '#E3D9EC' },
    { bg: 'bg-[#F4D9E2]', text: 'text-[#B8698D]', hex: '#F4D9E2' },
    { bg: 'bg-[#FADBD8]', text: 'text-[#C75F5A]', hex: '#FADBD8' },
];

interface Category {
    id: string;
    name: string;
    colorIndex: number;
}

const CategoryChangeDialog = ({
    isOpen,
    onClose,
    clipId,
    currentCategory,
    language
}: CategoryChangeDialogProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [existingCategories, setExistingCategories] = useState<string[]>([]);
    const [categoryClipCounts, setCategoryClipCounts] = useState<Record<string, number>>({});
    const [selectedCategory, setSelectedCategory] = useState(currentCategory);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newColorIndex, setNewColorIndex] = useState(4);
    const [isLoading, setIsLoading] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editColorIndex, setEditColorIndex] = useState(0);
    const [originalEditName, setOriginalEditName] = useState('');
    const [originalEditColorIndex, setOriginalEditColorIndex] = useState(0);

    // Reset state when dialog opens
    useEffect(() => {
        if (isOpen) {
            setSelectedCategory(currentCategory);
            setIsAddingNew(false);
            setNewCategoryName('');
        }
    }, [isOpen, currentCategory]);

    // Fetch user-defined categories
    useEffect(() => {
        const user = auth.currentUser;
        if (!user || !isOpen) return;

        const q = query(
            collection(db, 'categories'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Category));
            fetched.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setCategories(fetched);
        });

        return () => unsubscribe();
    }, [isOpen]);

    // Fetch existing categories from clips
    useEffect(() => {
        const user = auth.currentUser;
        if (!user || !isOpen) return;

        const q = query(
            collection(db, 'clips'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cats = new Set<string>();
            const counts: Record<string, number> = {};
            snapshot.docs.forEach(doc => {
                const cat = doc.data().category;
                if (cat) {
                    cats.add(cat);
                    counts[cat] = (counts[cat] || 0) + 1;
                }
            });
            setExistingCategories(Array.from(cats).sort());
            setCategoryClipCounts(counts);
        });

        return () => unsubscribe();
    }, [isOpen]);

    // Combine user categories and existing clip categories
    const allCategories = Array.from(new Set([
        ...categories.map(c => c.name),
        ...existingCategories
    ])).sort();

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        const user = auth.currentUser;
        if (!user) return;

        try {
            await addDoc(collection(db, 'categories'), {
                userId: user.uid,
                name: newCategoryName.trim(),
                colorIndex: newColorIndex,
                createdAt: serverTimestamp()
            });
            setSelectedCategory(newCategoryName.trim());
            setIsAddingNew(false);
            setNewCategoryName('');
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error(language === 'KR' ? '카테고리 추가 실패' : 'Failed to add category');
        }
    };

    const handleApplyChange = async () => {
        if (selectedCategory === currentCategory) return;

        setIsLoading(true);
        try {
            await updateDoc(doc(db, 'clips', clipId), {
                category: selectedCategory
            });
            toast.success(language === 'KR' ? '카테고리가 변경되었습니다' : 'Category updated');
            onClose();
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error(language === 'KR' ? '카테고리 변경 실패' : 'Failed to update category');
        } finally {
            setIsLoading(false);
        }
    };

    const hasChanges = selectedCategory !== currentCategory;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-[425px] bg-white dark:bg-[#1e1e1e] text-[#3d3d3d] dark:text-white"
                onPointerDownOutside={(e: Event) => e.preventDefault()}
                onInteractOutside={(e: Event) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {language === 'KR' ? '카테고리 변경' : 'Change Category'}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-3 py-4 max-h-[400px] overflow-y-auto">
                    {/* Current category indicator */}
                    <div className="text-xs text-[#959595]">
                        {language === 'KR' ? '현재' : 'Current'}: <span className="font-medium">{currentCategory}</span>
                    </div>

                    {/* Category list */}
                    <div className="space-y-2">
                        {allCategories.map((cat) => {
                            const color = getCategoryColor(cat);
                            const isSelected = selectedCategory === cat;
                            const isCurrent = currentCategory === cat;
                            const categoryDoc = categories.find(c => c.name === cat);

                            return (
                                <div key={cat} className="flex items-center gap-1">
                                    <button
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isSelected
                                            ? 'bg-[#21dba4]/10 border-2 border-[#21dba4]'
                                            : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                                            <span className={`font-medium ${isSelected ? 'text-[#21dba4]' : 'text-[#3d3d3d] dark:text-white'}`}>
                                                {cat}
                                            </span>
                                            {isCurrent && (
                                                <span className="text-xs text-[#959595] ml-1">
                                                    ({language === 'KR' ? '현재' : 'current'})
                                                </span>
                                            )}
                                        </div>
                                        {isSelected && <Check className="w-5 h-5 text-[#21dba4]" />}
                                    </button>
                                    {!isCurrent && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const colorIdx = categoryDoc?.colorIndex || 0;
                                                    if (categoryDoc) {
                                                        setEditingCategoryId(categoryDoc.id);
                                                        setEditColorIndex(colorIdx);
                                                    } else {
                                                        setEditingCategoryId('temp_' + cat);
                                                        setEditColorIndex(0);
                                                    }
                                                    setEditName(cat);
                                                    setOriginalEditName(cat);
                                                    setOriginalEditColorIndex(colorIdx);
                                                    setIsAddingNew(false);
                                                }}
                                                className="p-2 rounded-lg text-gray-400 hover:text-[#21dba4] hover:bg-[#21dba4]/10 transition-colors"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            {categoryDoc && (categoryClipCounts[cat] || 0) === 0 && (
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            await deleteDoc(doc(db, 'categories', categoryDoc.id));
                                                            toast.success(language === 'KR' ? '카테고리 삭제됨' : 'Category deleted');
                                                            if (selectedCategory === cat) {
                                                                setSelectedCategory(currentCategory);
                                                            }
                                                        } catch (error) {
                                                            toast.error(language === 'KR' ? '삭제 실패' : 'Delete failed');
                                                        }
                                                    }}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Edit category section - shown when editing */}
                    {editingCategoryId && (
                        <div className="mt-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-4">
                            <div className="text-sm font-medium text-[#3d3d3d] dark:text-white mb-2">
                                {language === 'KR' ? '카테고리 수정' : 'Edit Category'}
                            </div>
                            <Input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder={language === 'KR' ? '카테고리 이름' : 'Category name'}
                                className="rounded-lg border-gray-200 dark:border-gray-700 focus:ring-[#21dba4]"
                                autoFocus
                            />
                            <div className="flex gap-2 flex-wrap">
                                {PRESET_COLORS.map((c, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setEditColorIndex(idx)}
                                        className={`w-6 h-6 rounded-full ${c.bg} ${editColorIndex === idx ? 'ring-2 ring-[#21dba4] ring-offset-2' : ''} transition-all`}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={async () => {
                                        if (!editName.trim()) return;
                                        const categoryDoc = categories.find(c =>
                                            c.id === editingCategoryId || editingCategoryId === 'temp_' + c.name
                                        );
                                        try {
                                            if (categoryDoc && !editingCategoryId.startsWith('temp_')) {
                                                await updateDoc(doc(db, 'categories', categoryDoc.id), {
                                                    name: editName.trim(),
                                                    colorIndex: editColorIndex
                                                });
                                            } else {
                                                const user = auth.currentUser;
                                                if (user) {
                                                    await addDoc(collection(db, 'categories'), {
                                                        userId: user.uid,
                                                        name: editName.trim(),
                                                        colorIndex: editColorIndex,
                                                        createdAt: serverTimestamp()
                                                    });
                                                }
                                            }
                                            toast.success(language === 'KR' ? '수정됨' : 'Updated');
                                            setEditingCategoryId(null);
                                        } catch (error) {
                                            toast.error(language === 'KR' ? '수정 실패' : 'Update failed');
                                        }
                                    }}
                                    disabled={!editName.trim() || (editName.trim() === originalEditName && editColorIndex === originalEditColorIndex)}
                                    style={{
                                        backgroundColor: (editName.trim() && (editName.trim() !== originalEditName || editColorIndex !== originalEditColorIndex)) ? '#21dba4' : '#d1d5db',
                                        color: (editName.trim() && (editName.trim() !== originalEditName || editColorIndex !== originalEditColorIndex)) ? 'white' : '#6b7280'
                                    }}
                                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium hover:opacity-90 disabled:cursor-not-allowed"
                                >
                                    {language === 'KR' ? '수정' : 'Edit'}
                                </button>
                                <button
                                    onClick={() => setEditingCategoryId(null)}
                                    className="flex-1 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {language === 'KR' ? '취소' : 'Cancel'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add new category section */}
                    {!isAddingNew ? (
                        <button
                            onClick={() => setIsAddingNew(true)}
                            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-[#959595] hover:border-[#21dba4] hover:text-[#21dba4] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {language === 'KR' ? '새 카테고리 추가' : 'Add new category'}
                            </span>
                        </button>
                    ) : (
                        <div className="mt-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-4">
                            <Input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder={language === 'KR' ? '카테고리 이름' : 'Category name'}
                                className="rounded-lg border-gray-200 dark:border-gray-700 focus:ring-[#21dba4]"
                                autoFocus
                            />
                            <div className="flex gap-2 flex-wrap">
                                {PRESET_COLORS.map((color, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setNewColorIndex(idx)}
                                        className={`w-6 h-6 rounded-full ${color.bg} ${newColorIndex === idx ? 'ring-2 ring-[#21dba4] ring-offset-2' : ''} transition-all`}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddCategory}
                                    disabled={!newCategoryName.trim()}
                                    style={{ backgroundColor: '#21dba4', color: 'white' }}
                                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
                                >
                                    {language === 'KR' ? '만들기' : 'Create'}
                                </button>
                                <button
                                    onClick={() => { setIsAddingNew(false); setNewCategoryName(''); }}
                                    className="flex-1 py-2 px-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {language === 'KR' ? '취소' : 'Cancel'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Button
                        onClick={handleApplyChange}
                        disabled={!hasChanges || isLoading}
                        className={`${hasChanges
                            ? 'bg-[#21DBA4] hover:bg-[#1bc894] text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isLoading
                            ? (language === 'KR' ? '변경 중...' : 'Changing...')
                            : (language === 'KR' ? '변경' : 'Change')
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryChangeDialog;
