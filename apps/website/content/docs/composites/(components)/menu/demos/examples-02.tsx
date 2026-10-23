import { Menu } from '@vapor-ui/composites';
import { Button } from '@vapor-ui/core';
import {
    BellOnOutlineIcon,
    HelpCircleOutlineIcon,
    MenuOutlineIcon,
    SettingOutlineIcon,
    ViewModuleOutlineIcon,
} from '@vapor-ui/icons';

export default function Demo() {
    return (
        <Menu.Root trigger={<Button>Open menu</Button>}>
            <Menu.Group label="보기 유형">
                <Menu.Item label="목록" leading={<MenuOutlineIcon />} onClick={() => {}} />
                <Menu.Item label="보드" leading={<ViewModuleOutlineIcon />} onClick={() => {}} />
            </Menu.Group>

            <Menu.Group label="시스템 설정">
                <Menu.Item label="알림" leading={<BellOnOutlineIcon />} onClick={() => {}} />
                <Menu.Item label="일반" leading={<SettingOutlineIcon />} onClick={() => {}} />
            </Menu.Group>

            <Menu.Item label="도움말" leading={<HelpCircleOutlineIcon />} onClick={() => {}} />
        </Menu.Root>
    );
}
