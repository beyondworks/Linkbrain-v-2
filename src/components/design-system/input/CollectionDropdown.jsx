import { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

/**
 * CollectionDropdown 컴포넌트
 *
 * 아이템을 추가할 무드보드/컬렉션을 선택하는 드롭다운 메뉴.
 * 새 컬렉션 생성 기능 포함.
 *
 * 동작 방식:
 * 1. 버튼 클릭으로 드롭다운 메뉴 열기
 * 2. 기존 컬렉션 목록에서 선택
 * 3. "새 컬렉션 만들기"로 즉석 생성 가능
 * 4. 선택 시 onSelect 콜백 호출
 *
 * Props:
 * @param {Array} collections - 컬렉션 목록 [{ id, name, count }] [Required]
 * @param {string} selectedId - 현재 선택된 컬렉션 ID [Optional]
 * @param {function} onSelect - 컬렉션 선택 핸들러 (collectionId) => void [Required]
 * @param {function} onCreate - 새 컬렉션 생성 핸들러 (name) => void [Optional]
 * @param {string} buttonLabel - 버튼 레이블 [Optional, 기본값: 'Add to Board']
 * @param {string} variant - 버튼 스타일 ('contained' | 'outlined' | 'text') [Optional, 기본값: 'contained']
 * @param {string} size - 버튼 크기 ('small' | 'medium' | 'large') [Optional, 기본값: 'medium']
 * @param {boolean} isFullWidth - 전체 너비 사용 [Optional, 기본값: false]
 * @param {number} menuZIndex - 메뉴 z-index (모달 내부 사용 시 높은 값 필요) [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <CollectionDropdown
 *   collections={moodboards}
 *   selectedId={currentBoard?.id}
 *   onSelect={handleAddToBoard}
 *   onCreate={handleCreateBoard}
 * />
 */
export function CollectionDropdown({
  collections = [],
  selectedId,
  onSelect,
  onCreate,
  buttonLabel = 'Add to Board',
  variant = 'contained',
  size = 'medium',
  isFullWidth = false,
  menuZIndex,
  sx,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const isOpen = Boolean(anchorEl);

  /**
   * 메뉴 열기
   */
  const handleOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  /**
   * 메뉴 닫기
   */
  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setIsCreating(false);
    setNewCollectionName('');
  }, []);

  /**
   * 컬렉션 선택
   */
  const handleSelect = useCallback(
    (collectionId) => {
      onSelect(collectionId);
      handleClose();
    },
    [onSelect, handleClose]
  );

  /**
   * 새 컬렉션 생성 모드 활성화
   */
  const handleStartCreate = useCallback(() => {
    setIsCreating(true);
  }, []);

  /**
   * 새 컬렉션 생성 확정
   */
  const handleCreate = useCallback(() => {
    if (newCollectionName.trim() && onCreate) {
      onCreate(newCollectionName.trim());
      handleClose();
    }
  }, [newCollectionName, onCreate, handleClose]);

  /**
   * 입력 키 이벤트
   */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        handleCreate();
      } else if (e.key === 'Escape') {
        setIsCreating(false);
        setNewCollectionName('');
      }
    },
    [handleCreate]
  );

  return (
    <Box sx={sx}>
      {/* 트리거 버튼 */}
      <Button
        variant={variant}
        size={size}
        onClick={handleOpen}
        endIcon={<KeyboardArrowDownIcon />}
        fullWidth={isFullWidth}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
        }}
        aria-controls={isOpen ? 'collection-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={isOpen ? 'true' : undefined}
      >
        {buttonLabel}
      </Button>

      {/* 드롭다운 메뉴 */}
      <Menu
        id="collection-menu"
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={menuZIndex ? { zIndex: menuZIndex } : undefined}
        slotProps={{
          paper: {
            sx: {
              minWidth: 240,
              maxWidth: 320,
              maxHeight: 400,
              mt: 0.5,
            },
          },
        }}
      >
        {/* 헤더 */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Select Moodboard
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {collections.length} boards available
          </Typography>
        </Box>

        <Divider />

        {/* 컬렉션 목록 */}
        <Box sx={{ maxHeight: 240, overflow: 'auto' }}>
          {collections.length === 0 ? (
            <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
              <FolderIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No moodboards yet
              </Typography>
            </Box>
          ) : (
            collections.map((collection) => (
              <MenuItem
                key={collection.id}
                onClick={() => handleSelect(collection.id)}
                selected={collection.id === selectedId}
                sx={{
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.lighter',
                  },
                }}
              >
                <ListItemIcon>
                  <FolderIcon
                    sx={{
                      color: collection.id === selectedId ? 'primary.main' : 'text.secondary',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={collection.name}
                  secondary={`${collection.count || 0} items`}
                  primaryTypographyProps={{
                    fontWeight: collection.id === selectedId ? 600 : 400,
                  }}
                />
                {collection.id === selectedId && (
                  <CheckIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                )}
              </MenuItem>
            ))
          )}
        </Box>

        <Divider />

        {/* 새 컬렉션 생성 */}
        {onCreate && (
          <Box sx={{ p: 1 }}>
            {isCreating ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                <TextField
                  autoFocus
                  size="small"
                  placeholder="Board name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  sx={{ flex: 1 }}
                  inputProps={{ maxLength: 50 }}
                />
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleCreate}
                  disabled={!newCollectionName.trim()}
                >
                  <CheckIcon />
                </IconButton>
              </Box>
            ) : (
              <MenuItem onClick={handleStartCreate} sx={{ borderRadius: 1 }}>
                <ListItemIcon>
                  <CreateNewFolderIcon sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Create new board"
                  primaryTypographyProps={{
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                />
                <AddIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              </MenuItem>
            )}
          </Box>
        )}
      </Menu>
    </Box>
  );
}
