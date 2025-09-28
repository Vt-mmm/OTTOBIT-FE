import type { DriveStep } from 'driver.js';
import { STUDIO_SELECTORS } from './selectors';

export const studioTourSteps: DriveStep[] = [
  // Intro: Top bar area overview
  {
    element: STUDIO_SELECTORS.topbar,
    disableActiveInteraction: true,
    popover: {
      title: 'Thanh công cụ (Top Bar)',
      description:
        'Khu vực điều khiển chính của Studio: chọn map, xem gợi ý, mở camera/micro:bit và chạy chương trình.',
      side: 'bottom',
      align: 'start',
      popoverClass: 'studio-popover',
      showProgress: true,
    },
    onHighlightStarted: (element, _step, { driver }) => {
      try {
        driver.setConfig({ ...driver.getConfig(), overlayOpacity: 0.10, stagePadding: 20, stageRadius: 12 });
      } catch {}
      element?.classList?.add('studio-tour-accent');
    },
    onDeselected: (element, _step, { driver }) => {
      try { driver.setConfig({ ...driver.getConfig(), overlayOpacity: 0.1 }); } catch {}
      element?.classList?.remove('studio-tour-accent');
    },
  },

  // Logo home
  {
    element: STUDIO_SELECTORS.logoHome,
    disableActiveInteraction: true,
    popover: {
      title: 'Logo về trang chủ',
      description: 'Nhấn để quay về trang chính.',
      side: 'bottom',
      align: 'start',
      popoverClass: 'studio-popover',
    },
  },

  // Challenge selector
  {
    element: STUDIO_SELECTORS.challengeNav,
    disableActiveInteraction: true,
    popover: {
      title: 'Chọn map/challenge',
      description: 'Chọn nhanh challenge trong bài học. Những map bị khóa cần hoàn thành map trước đó.',
      side: 'bottom',
      align: 'center',
      popoverClass: 'studio-popover',
    },
  },

  // Buttons group (gộp)
  {
    element: STUDIO_SELECTORS.actions,
    disableActiveInteraction: true,
    popover: {
      title: 'Nhóm nút thao tác',
      description: 'Từ trái qua phải: gửi micro:bit, mở camera, gợi ý, cờ, chạy/dừng, tải lại map.',
      side: 'bottom',
      align: 'center',
      popoverClass: 'studio-popover',
    },
    onHighlightStarted: (el, _step, { driver }) => {
      try { (el as HTMLElement)?.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch {}
      setTimeout(() => { try { driver.refresh(); } catch {} }, 50);
    },
    onHighlighted: (_el, _step, { driver }) => {
      setTimeout(() => { try { driver.refresh(); } catch {} }, 100);
    }
  },
  
  // Left: Toolbox categories
  {
    element: STUDIO_SELECTORS.toolbox,
    disableActiveInteraction: true,
    popover: {
      title: 'Toolbox',
      description: 'Chọn nhóm khối lệnh. Khi kéo thả xong, toolbox auto đóng để tập trung vào workspace.',
      side: 'right',
      align: 'center',
      popoverClass: 'studio-popover',
    },
  },

  // Center-left: Workspace area
  {
    element: STUDIO_SELECTORS.workspaceCanvas,
    disableActiveInteraction: true,
    popover: {
      title: 'Vùng soạn thảo',
      description: 'Kéo thả khối lệnh để tạo chương trình. Bạn có thể phóng to/thu nhỏ và kéo để di chuyển khung nhìn.',
      side: 'right',
      align: 'start',
      popoverClass: 'studio-popover',
    },
  },

  // Right: Simulator container
  {
    element: STUDIO_SELECTORS.simulator,
    disableActiveInteraction: true,
    popover: {
      title: 'Phaser Simulator',
      description: 'Khu vực mô phỏng robot. Kết quả chạy, trạng thái và điểm số sẽ hiển thị tại đây.',
      side: 'left',
      align: 'center',
      popoverClass: 'studio-popover',
    },
  },
  {
    element: STUDIO_SELECTORS.gameStatus,
    disableActiveInteraction: true,
    popover: {
      title: 'Trạng thái mô phỏng',
      description: 'Xem nhanh map hiện tại và trạng thái chương trình (đang chạy/hoàn thành).',
      side: 'left',
      align: 'start',
      popoverClass: 'studio-popover',
    },
  },
];
