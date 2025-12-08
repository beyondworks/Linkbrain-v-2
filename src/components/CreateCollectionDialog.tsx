import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface CreateCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; color: string }) => void;
  language?: 'KR' | 'EN';
}

const COLORS = [
  { name: 'Mint', value: 'bg-[#21DBA4]' },
  { name: 'Blue', value: 'bg-[#61DAFB]' },
  { name: 'Purple', value: 'bg-[#B388FF]' },
  { name: 'Gold', value: 'bg-[#FFD700]' },
  { name: 'Red', value: 'bg-[#FF8A80]' },
];

const CreateCollectionDialog = ({ isOpen, onClose, onCreate, language = 'KR' }: CreateCollectionDialogProps) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!name.trim()) return;

    onCreate({ name, color: selectedColor });

    setName('');
    setSelectedColor(COLORS[0].value);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[425px] bg-white text-[#3d3d3d]"
        onPointerDownOutside={(e: Event) => e.preventDefault()}
        onInteractOutside={(e: Event) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {language === 'KR' ? "새 컬렉션 생성" : "Create New Collection"}
          </DialogTitle>
          <DialogDescription>
            {language === 'KR' ? "컬렉션의 이름과 색상을 선택하세요." : "Enter a name and choose a color for your new collection."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-medium text-[#959595]">
              {language === 'KR' ? "컬렉션 이름" : "Collection Name"}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                e.stopPropagation();
                setName(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              placeholder={language === 'KR' ? "예: 디자인 영감" : "e.g., Design Inspiration"}
              className="border-[#E0E0E0] focus-visible:ring-[#21DBA4]"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium text-[#959595]">
              {language === 'KR' ? "색상 코드" : "Color Code"}
            </Label>
            <div className="flex items-center gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColor(color.value);
                  }}
                  className={`w-8 h-8 rounded-full ${color.value} transition-transform ${selectedColor === color.value
                    ? 'ring-2 ring-offset-2 ring-[#959595] scale-110'
                    : 'hover:scale-105'
                    }`}
                  aria-label={`Select ${color.name}`}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="border-none shadow-none hover:bg-gray-50 text-[#959595]"
            >
              {language === 'KR' ? "취소" : "Cancel"}
            </Button>
            <Button
              type="submit"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="bg-[#21DBA4] hover:bg-[#1wb993] text-white rounded-full px-8"
              disabled={!name.trim()}
            >
              {language === 'KR' ? "만들기" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCollectionDialog;
