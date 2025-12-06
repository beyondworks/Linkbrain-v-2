import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, Palette } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface CategoryManagementProps {
    user: any;
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
    order?: number;
}

const CategoryManagement = ({ user, language }: CategoryManagementProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newColorIndex, setNewColorIndex] = useState(4);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editColorIndex, setEditColorIndex] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'categories'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Category));
            fetched.sort((a, b) => (a.order || 0) - (b.order || 0));
            setCategories(fetched);
        });

        return () => unsubscribe();
    }, [user]);

    const handleAddCategory = async () => {
        if (!newCategoryName.trim() || !user) return;

        try {
            await addDoc(collection(db, 'categories'), {
                userId: user.uid,
                name: newCategoryName.trim(),
                colorIndex: newColorIndex,
                order: categories.length,
                createdAt: serverTimestamp()
            });
            setNewCategoryName('');
            setIsAdding(false);
            toast.success(language === 'KR' ? '카테고리가 추가되었습니다' : 'Category added');
        } catch (error) {
            console.error('Error adding category:', error);
            toast.error(language === 'KR' ? '카테고리 추가 실패' : 'Failed to add category');
        }
    };

    const handleStartEdit = (cat: Category) => {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditColorIndex(cat.colorIndex);
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editName.trim()) return;

        try {
            await updateDoc(doc(db, 'categories', editingId), {
                name: editName.trim(),
                colorIndex: editColorIndex
            });
            setEditingId(null);
            toast.success(language === 'KR' ? '카테고리가 수정되었습니다' : 'Category updated');
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error(language === 'KR' ? '카테고리 수정 실패' : 'Failed to update category');
        }
    };

    const handleDeleteClick = (cat: Category) => {
        setCategoryToDelete(cat);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            await deleteDoc(doc(db, 'categories', categoryToDelete.id));
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
            toast.success(language === 'KR' ? '카테고리가 삭제되었습니다' : 'Category deleted');
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error(language === 'KR' ? '카테고리 삭제 실패' : 'Failed to delete category');
        }
    };

    return (
        <div className="bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-[#E0E0E0] dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F5F5F5] dark:border-gray-800 bg-[#FAFAFA] dark:bg-[#252525] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#959595] uppercase tracking-wider">
                    {language === 'KR' ? '카테고리 관리' : 'CATEGORY MANAGEMENT'}
                </h3>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-[#959595] hover:text-[#21DBA4] transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="divide-y divide-[#F5F5F5] dark:divide-gray-800">
                {/* Add new category form */}
                {isAdding && (
                    <div className="px-6 py-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder={language === 'KR' ? '카테고리 이름' : 'Category name'}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252525] text-[#3d3d3d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#21DBA4]"
                                autoFocus
                            />
                            <button
                                onClick={handleAddCategory}
                                disabled={!newCategoryName.trim()}
                                className="p-2 rounded-lg bg-[#21DBA4] text-white hover:bg-[#1bc894] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => { setIsAdding(false); setNewCategoryName(''); }}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-[#959595] hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {PRESET_COLORS.map((color, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setNewColorIndex(idx)}
                                    className={`w-7 h-7 rounded-full ${color.bg} ${newColorIndex === idx ? 'ring-2 ring-[#21DBA4] ring-offset-2' : ''} transition-all`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Category list */}
                {categories.length === 0 && !isAdding ? (
                    <div className="px-6 py-8 text-center text-[#959595]">
                        {language === 'KR' ? '추가된 카테고리가 없습니다' : 'No categories added'}
                    </div>
                ) : (
                    categories.map((cat) => (
                        <div key={cat.id} className="px-6 py-3 flex items-center justify-between group">
                            {editingId === cat.id ? (
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252525] text-[#3d3d3d] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#21DBA4]"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleSaveEdit}
                                            className="p-1.5 rounded-lg bg-[#21DBA4] text-white hover:bg-[#1bc894] transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-[#959595] hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        {PRESET_COLORS.map((color, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setEditColorIndex(idx)}
                                                className={`w-6 h-6 rounded-full ${color.bg} ${editColorIndex === idx ? 'ring-2 ring-[#21DBA4] ring-offset-1' : ''} transition-all`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full ${PRESET_COLORS[cat.colorIndex]?.bg || PRESET_COLORS[0].bg}`} />
                                        <span className="text-[#3d3d3d] dark:text-white font-medium">{cat.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleStartEdit(cat)}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-[#959595] hover:text-[#21DBA4] transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(cat)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[#959595] hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            <DeleteConfirmationDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                title={language === 'KR' ? '카테고리 삭제' : 'Delete Category'}
                descriptionLines={language === 'KR'
                    ? [`"${categoryToDelete?.name}" 카테고리를 삭제하시겠습니까?`, '이 작업은 되돌릴 수 없습니다.']
                    : [`Delete "${categoryToDelete?.name}" category?`, 'This action cannot be undone.']}
                language={language}
            />
        </div>
    );
};

export default CategoryManagement;
