import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { Box, Menu as MenuPrimitives } from '@vapor-ui/core';

import type { SlotProps } from '~/utils/create-slots';
import { createSlots } from '~/utils/create-slots';

const slots = createSlots({
    trigger: MenuPrimitives.Trigger,
});

export const MenuRoot = ({
    // functional
    open,
    defaultOpen,
    onOpenChange,
    modal,
    actionsRef,
    container,

    // variants
    isDisabled,
    side,
    align,

    // slots
    trigger,
    children,
}: MenuRoot.Props) => {
    return (
        <MenuPrimitives.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            modal={modal}
            actionsRef={actionsRef}

            disabled={isDisabled}
        >
            <slots.trigger render={trigger} />

            <MenuPrimitives.PortalPrimitive container={container}>
                <MenuPrimitives.PositionerPrimitive side={side} align={align}>
                    <MenuPrimitives.PopupPrimitive>{children}</MenuPrimitives.PopupPrimitive>
                </MenuPrimitives.PositionerPrimitive>
            </MenuPrimitives.PortalPrimitive>
        </MenuPrimitives.Root>
    );
};

type Slots = SlotProps<typeof slots>;
type RootProps = MenuPrimitives.Root.Props;
type PositionerProps = MenuPrimitives.PositionerPrimitive.Props;
type PortalProps = MenuPrimitives.PortalPrimitive.Props;

export interface MenuRootProps {
    /**
     * 메뉴 열림 상태(제어). 사용자 액션에 반응한 상태 변경을 외부에서 추적해야 할 때 사용한다.
     * 상태의 변경을 추적할 필요가 없다면 defaultOpen을 사용한다.
     */
    open?: RootProps['open'];

    /**
     * 열림 상태 변경 콜백. 트리거·오버레이 클릭·ESC 등 모든 열림/닫힘 경로에서 호출된다.
     * @example
     * <Menu.Root onOpenChange={(open) => setOpen(open)} />
     */
    onOpenChange?: RootProps['onOpenChange'];

    /**
     * 마운트 시 초기 열림 여부(비제어).
     * @default false
     */
    defaultOpen?: RootProps['defaultOpen'];

    /**
     * 메뉴가 모달로 동작할지 여부. `true`이면 열려 있는 동안 배경 인터랙션이 차단된다.
     * @default true
     */
    modal?: RootProps['modal'];

    /**
     * 메뉴를 프로그래밍적으로 조작하기 위한 ref를 지정한다.
     * @example
     * const actionsRef = useRef<Menu.Actions>(null);
     * actionsRef.current?.unmount();
     */
    actionsRef?: RootProps['actionsRef'];

    /**
     * 트리거를 비활성화한다. 비활성화된 트리거는 메뉴를 열 수 없다.
     * @default false
     */
    isDisabled?: RootProps['disabled'];

    /**
     * Portal 대상 컨테이너. SSR·shadow DOM·특정 스택 컨텍스트에서 팝업 위치 제어가 필요할 때만 지정한다.
     * @default document.body
     */
    container?: PortalProps['container'];

    /**
     * 트리거를 기준으로 팝업이 열리는 방향.
     * @default "bottom"
     */
    side?: PositionerProps['side'];

    /**
     * 트리거와 팝업의 정렬 기준.
     * @default "center"
     */
    align?: PositionerProps['align'];

    /**
     * 메뉴를 여는 진입 요소.
     * @example
     * <Menu.Root trigger={<Button>메뉴 열기</Button>} />
     */
    trigger?: Slots['trigger'];

    /**
     * 그룹 내부에 표시할 요소.
     */
    children: ReactNode;
}

export namespace MenuRoot {
    export type Actions = MenuPrimitives.Root.Actions;
    export type Props = MenuRootProps;
}

/* -----------------------------------------------------------------------------------------------*/

const groupSlots = createSlots({
    label: MenuPrimitives.GroupLabel,
});

export const MenuGroup = ({ label, children }: MenuGroup.Props) => {
    return (
        <MenuPrimitives.Group>
            <groupSlots.label render={label} />
            {children}
        </MenuPrimitives.Group>
    );
};

type GroupSlots = SlotProps<typeof groupSlots, 'label'>;

export interface MenuGroupProps {
    /**
     * 그룹 상단에 표시되는 라벨. 스크린리더가 그룹 이름으로 낭독한다.
     */
    label: GroupSlots['label'];

    /**
     * 그룹 내부에 표시할 요소.
     */
    children: ReactNode;
}

export namespace MenuGroup {
    export type Props = MenuGroupProps;
}

/* -----------------------------------------------------------------------------------------------*/

const itemSlots = createSlots({
    leading: Box,
    trailing: Box,
    label: Box,
});

export const MenuItem = ({ variant, label, leading, trailing, onClick }: MenuItem.Props) => {
    return (
        <MenuPrimitives.Item
            onClick={onClick}
            $css={{ color: variant === 'critical' ? '$fg-danger' : '$fg-normal' }}
        >
            <itemSlots.leading render={leading} />
            <itemSlots.label render={label} $css={{ flex: 1 }} />
            <itemSlots.trailing render={trailing} />
        </MenuPrimitives.Item>
    );
};

type ItemSlots = SlotProps<typeof itemSlots, 'label'>;
type ItemProps = MenuPrimitives.Item.Props;

export interface MenuItemProps {
    /**
     * 항목 클릭 시 호출되는 이벤트 핸들러.
     * @example
     * <Menu.Item onClick={handleSelect} label="Copy" />
     */
    onClick: ItemProps['onClick'];

    /**
     * 메뉴 아이템의 시각적 위계를 결정한다.
     * @default "default"
     */
    variant?: 'default' | 'critical';

    /**
     * 항목 좌측에 표시되는 요소. 주로 아이콘을 배치한다.
     */
    leading?: ItemSlots['leading'];

    /**
     * 항목 우측에 표시되는 요소. 단축키·보조 아이콘 등을 배치한다.
     */
    trailing?: ItemSlots['trailing'];

    /**
     * 항목의 텍스트 라벨.
     */
    label: ItemSlots['label'];
}

export namespace MenuItem {
    export type Props = MenuItemProps;
}

/* -----------------------------------------------------------------------------------------------*/

type MenuCheckGroupContextValue =
    | { mode: 'single' }
    | { mode: 'multiple'; value: string[]; handleValueChange: (value: string) => void };

const MenuCheckGroupContext = createContext<MenuCheckGroupContextValue | undefined>(undefined);

const useMenuCheckGroupContext = () => {
    const context = useContext(MenuCheckGroupContext);
    if (context === undefined) {
        throw new Error(
            'MenuCheckGroupContext is missing. MenuCheckGroup parts must be placed within <Menu.CheckGroup>.',
        );
    }
    return context;
};

/* -----------------------------------------------------------------------------------------------*/

const checkGroupSlots = createSlots({
    label: MenuPrimitives.GroupLabel,
});

export const MenuCheckGroup = (props: MenuCheckGroup.Props) => {
    const { mode } = props;

    if (mode === 'single') return <SingleCheckGroup {...props} />;
    return <MultipleCheckGroup {...props} />;
};

const SingleCheckGroup = ({
    value,
    defaultValue,
    onValueChange,
    label,
    children,
}: MenuSingleCheckGroupProps) => {
    const context = useMemo<MenuCheckGroupContextValue>(() => ({ mode: 'single' }), []);

    return (
        <MenuCheckGroupContext.Provider value={context}>
            <MenuPrimitives.RadioGroup
                value={value}
                defaultValue={defaultValue}
                onValueChange={onValueChange}
            >
                <checkGroupSlots.label render={label} />
                {children}
            </MenuPrimitives.RadioGroup>
        </MenuCheckGroupContext.Provider>
    );
};

const MultipleCheckGroup = ({
    value: valueProp,
    defaultValue,
    onValueChange,
    label,
    children,
}: MenuMultipleCheckGroupProps) => {
    const [value, setValueState] = useControlled<string[]>({
        name: 'MenuCheckGroup',
        controlled: valueProp,
        default: defaultValue ?? [],
    });

    const handleValueChange = useStableCallback((nextValue: string) => {
        const next = value.includes(nextValue)
            ? value.filter((v) => v !== nextValue)
            : [...value, nextValue];

        onValueChange?.(next);
        setValueState(next);
    });

    const context = useMemo<MenuCheckGroupContextValue>(
        () => ({ mode: 'multiple', value, handleValueChange }),
        [value, handleValueChange],
    );

    return (
        <MenuCheckGroupContext.Provider value={context}>
            <MenuPrimitives.Group>
                <checkGroupSlots.label render={label} />
                {children}
            </MenuPrimitives.Group>
        </MenuCheckGroupContext.Provider>
    );
};

type CheckGroupSlots = SlotProps<typeof checkGroupSlots, 'label'>;

export interface MenuSingleCheckGroupProps {
    /**
     * 선택 모드. `single`은 라디오 그룹처럼 최대 하나의 값만 선택된다.
     */
    mode: 'single';

    /**
     * 선택된 값(제어). 상태의 변경을 추적할 필요가 없다면 defaultValue를 사용한다.
     */
    value?: string;

    /**
     * 마운트 시 초기 선택 값(비제어).
     */
    defaultValue?: string;

    /**
     * 선택이 바뀔 때 호출된다. 새로 선택된 값 하나가 전달된다.
     * @example
     * <Menu.CheckGroup mode="single" onValueChange={(value) => setValue(value)} />
     */
    onValueChange?: (value: string) => void;

    /**
     * 그룹 상단에 표시되는 라벨. 스크린리더가 그룹 이름으로 낭독한다.
     */
    label: CheckGroupSlots['label'];

    /**
     * 그룹 내부에 표시할 요소.
     */
    children: ReactNode;
}

export interface MenuMultipleCheckGroupProps {
    /**
     * 선택 모드. `multiple`은 체크박스 그룹처럼 여러 값을 토글한다.
     */
    mode: 'multiple';

    /**
     * 선택된 값 배열(제어). 상태의 변경을 추적할 필요가 없다면 defaultValue를 사용한다.
     */
    value?: string[];

    /**
     * 마운트 시 초기 선택 값 배열(비제어).
     * @default []
     */
    defaultValue?: string[];

    /**
     * 선택이 바뀔 때 호출된다. 토글 이후의 전체 선택 배열이 전달된다.
     * @example
     * <Menu.CheckGroup mode="multiple" onValueChange={(values) => setValues(values)} />
     */
    onValueChange?: (value: string[]) => void;

    /**
     * 그룹 상단에 표시되는 라벨. 스크린리더가 그룹 이름으로 낭독한다.
     */
    label: CheckGroupSlots['label'];

    /**
     * 그룹 내부에 표시할 요소.
     */
    children: ReactNode;
}

export namespace MenuCheckGroup {
    export type Mode = 'single' | 'multiple';
    export type Props = MenuSingleCheckGroupProps | MenuMultipleCheckGroupProps;
}

/* -----------------------------------------------------------------------------------------------*/

const checkItemSlots = createSlots({
    label: Box,
    trailing: Box,
});

export const MenuCheckItem = ({
    value: valueProp,
    onClick,
    label,
    trailing,
}: MenuCheckItem.Props) => {
    const context = useMenuCheckGroupContext();
    const { mode } = context;

    if (mode === 'single') {
        return (
            <MenuPrimitives.RadioItem value={valueProp} onClick={onClick}>
                <checkItemSlots.label render={label} />
                <checkItemSlots.trailing render={trailing} />
            </MenuPrimitives.RadioItem>
        );
    }

    const { value, handleValueChange } = context;

    return (
        <MenuPrimitives.CheckboxItem
            checked={value.includes(valueProp)}
            onCheckedChange={() => handleValueChange(valueProp)}
            onClick={onClick}
        >
            <checkItemSlots.label render={label} />
            <checkItemSlots.trailing render={trailing} />
        </MenuPrimitives.CheckboxItem>
    );
};

type CheckItemSlots = SlotProps<typeof checkItemSlots, 'label'>;
type RadioItemProps = MenuPrimitives.RadioItemPrimitive.Props;
type CheckboxItemProps = MenuPrimitives.CheckboxItemPrimitive.Props;

export interface MenuCheckItemProps {
    /**
     * 항목이 대표하는 값. 그룹의 선택 상태 키로 사용된다.
     */
    value: string;

    /**
     * 항목 클릭 시 호출된다. 선택 토글은 그룹이 처리하므로, 추가 사이드이펙트가 필요한 경우에만 지정한다.
     * @example
     * <Menu.CheckItem onClick={handleClick} value="option-1" label="Option 1" />
     */
    onClick?: RadioItemProps['onClick'] | CheckboxItemProps['onClick'];

    /**
     * 항목의 텍스트 라벨.
     */
    label: CheckItemSlots['label'];

    /**
     * 항목 우측에 표시되는 요소. 단축키·보조 아이콘 등을 배치한다.
     */
    trailing?: CheckItemSlots['trailing'];
}

export namespace MenuCheckItem {
    export type Props = MenuCheckItemProps;
}

/* -----------------------------------------------------------------------------------------------*/

const submenuSlots = createSlots({
    trigger: MenuPrimitives.SubmenuTriggerItem,
});

export const MenuSubmenu = ({ trigger, children }: MenuSubmenu.Props) => {
    return (
        <MenuPrimitives.SubmenuRoot>
            <submenuSlots.trigger render={trigger} />

            <MenuPrimitives.PortalPrimitive>
                <MenuPrimitives.PositionerPrimitive side="right" sideOffset={0}>
                    <MenuPrimitives.SubmenuPopupPrimitive>
                        {children}
                    </MenuPrimitives.SubmenuPopupPrimitive>
                </MenuPrimitives.PositionerPrimitive>
            </MenuPrimitives.PortalPrimitive>
        </MenuPrimitives.SubmenuRoot>
    );
};

type SubmenuSlots = SlotProps<typeof submenuSlots>;

export interface MenuSubmenuProps extends Omit<MenuRoot.Props, keyof Slots> {
    /**
     * 중첩 메뉴를 여는 아이템의 레이블. React Element를 전달하여 커스텀할 수도 있다.
     * @example
     * // #1
     * <Menu.Submenu trigger="중첩 메뉴 열기" />
     * // #2
     * <Menu.Submenu trigger={<Menu.Item right={<HeartIcon />} />} />
     */
    trigger: SubmenuSlots['trigger'];

    /**
     * 중첩 메뉴 내부에 표시할 요소.
     */
    children: ReactNode;
}

export namespace MenuSubmenu {
    export type Props = MenuSubmenuProps;
}
