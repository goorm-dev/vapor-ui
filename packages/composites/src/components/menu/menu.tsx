import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { Box, Menu as MenuPrimitives } from '@vapor-ui/core';
import { ConfirmOutlineIcon } from '@vapor-ui/icons';

import type { SlotProps } from '~/utils/create-slots';
import { createSlots } from '~/utils/create-slots';

interface MenuContextValue {
    nested: true;
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

const useMenuContext = () => useContext(MenuContext);

/* -----------------------------------------------------------------------------------------------*/

const rootSlots = createSlots({
    trigger: MenuPrimitives.Trigger,
});

const submenuSlots = createSlots({
    trigger: MenuPrimitives.SubmenuTriggerItem,
});

export const MenuRoot = (props: MenuRoot.Props) => {
    const parent = useMenuContext();
    const contextValue = useMemo<MenuContextValue>(() => ({ nested: true }), []);

    return (
        <MenuContext.Provider value={contextValue}>
            {parent === undefined ? <ParentMenu {...props} /> : <Submenu {...props} />}
        </MenuContext.Provider>
    );
};

const ParentMenu = ({
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
            <rootSlots.trigger render={trigger} />

            <MenuPrimitives.PortalPrimitive container={container}>
                <MenuPrimitives.PositionerPrimitive side={side} align={align}>
                    <MenuPrimitives.PopupPrimitive $css={{ transition: 'none' }}>
                        {children}
                    </MenuPrimitives.PopupPrimitive>
                </MenuPrimitives.PositionerPrimitive>
            </MenuPrimitives.PortalPrimitive>
        </MenuPrimitives.Root>
    );
};

const Submenu = ({
    // functional
    open,
    defaultOpen,
    onOpenChange,
    actionsRef,
    container,

    // variants
    isDisabled,
    side = 'right',
    align,

    // slots
    trigger,
    children,
}: MenuRoot.Props) => {
    return (
        <MenuPrimitives.SubmenuRoot
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            actionsRef={actionsRef}
            disabled={isDisabled}
        >
            <submenuSlots.trigger render={trigger} />

            <MenuPrimitives.PortalPrimitive container={container}>
                <MenuPrimitives.PositionerPrimitive side={side} sideOffset={0} align={align}>
                    <MenuPrimitives.SubmenuPopupPrimitive $css={{ transition: 'none' }}>
                        {children}
                    </MenuPrimitives.SubmenuPopupPrimitive>
                </MenuPrimitives.PositionerPrimitive>
            </MenuPrimitives.PortalPrimitive>
        </MenuPrimitives.SubmenuRoot>
    );
};

type RootSlots = SlotProps<typeof rootSlots | typeof submenuSlots>;
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
     * 최상위 `Menu.Root`에서만 유효하며, 중첩된 `Menu.Root`에서는 무시된다.
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
     * - 최상위 `Menu.Root`에서는 `Trigger`로 렌더링된다.
     * - 다른 `Menu.Root` 하위에서 사용되면 부모 메뉴의 아이템으로 동작하는 `SubmenuTrigger`로 렌더링된다.
     * @example
     * <Menu.Root trigger={<Button>메뉴 열기</Button>} />
     */
    trigger?: RootSlots['trigger'];

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
        <>
            <Separator />

            <MenuPrimitives.Group>
                <groupSlots.label render={label} />
                {children}
            </MenuPrimitives.Group>

            <Separator />
        </>
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
    const gridTemplateAreas = `"${leading ? 'leading' : ''} label ${trailing ? 'trailing' : ''}"`;
    const gridTemplateColumns = `${leading ? '1rem' : ''} 1fr ${trailing ? 'auto' : ''}`;

    return (
        <MenuPrimitives.Item
            onClick={onClick}
            $css={{
                color: variant === 'critical' ? '$fg-danger' : '$fg-normal',
                display: 'grid',
                gridTemplateAreas,
                gridTemplateColumns,
            }}
        >
            <itemSlots.leading render={leading} $css={{ gridArea: 'leading' }} />
            <itemSlots.label render={label} $css={{ flex: 1, gridArea: 'label' }} />
            <itemSlots.trailing render={trailing} $css={{ gridArea: 'trailing' }} />
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
    | {
          mode: 'single';
          hasSelection: boolean;
      }
    | {
          mode: 'multiple';
          hasSelection: boolean;
          value: string[];
          handleValueChange: (value: string) => void;
      };

const MenuCheckGroupContext = createContext<MenuCheckGroupContextValue | undefined>(undefined);

const useOptionalMenuCheckGroupContext = () => useContext(MenuCheckGroupContext);

const useMenuCheckGroupContext = () => {
    const context = useOptionalMenuCheckGroupContext();
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
    value: valueProp,
    defaultValue,
    onValueChange,
    label,
    children,
}: MenuSingleCheckGroupProps) => {
    const [value, setValueState] = useControlled<string | undefined>({
        name: 'MenuCheckGroup',
        controlled: valueProp,
        default: defaultValue,
    });

    const handleValueChange = useStableCallback((next: string) => {
        onValueChange?.(next);
        setValueState(next);
    });

    const hasSelection = !!value;

    const context = useMemo<MenuCheckGroupContextValue>(
        () => ({ mode: 'single', hasSelection }),
        [hasSelection],
    );

    return (
        <MenuCheckGroupContext.Provider value={context}>
            <Separator />

            <MenuPrimitives.RadioGroup value={value} onValueChange={handleValueChange}>
                <checkGroupSlots.label render={label} />
                {children}
            </MenuPrimitives.RadioGroup>

            <Separator />
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

    const hasSelection = !!value.length;

    const context = useMemo<MenuCheckGroupContextValue>(
        () => ({ mode: 'multiple', hasSelection, value, handleValueChange }),
        [hasSelection, value, handleValueChange],
    );

    return (
        <MenuCheckGroupContext.Provider value={context}>
            <Separator />

            <MenuPrimitives.Group>
                <checkGroupSlots.label render={label} />
                {children}
            </MenuPrimitives.Group>

            <Separator />
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
    leading: Box,
    label: Box,
    trailing: Box,
});

export const MenuCheckItem = ({
    value: valueProp,
    onClick,
    leading,
    label,
    trailing,
}: MenuCheckItem.Props) => {
    const context = useMenuCheckGroupContext();
    const { mode, hasSelection } = context;
    const gridTemplateAreas = `"${hasSelection ? 'marker' : ''} ${leading ? 'leading' : ''} label ${trailing ? 'trailing' : ''}"`;
    const gridTemplateColumns = `${hasSelection ? '1rem' : ''} ${leading ? 'auto' : ''} 1fr ${trailing ? 'auto' : ''}`;

    if (mode === 'single') {
        return (
            <MenuPrimitives.RadioItemPrimitive
                closeOnClick
                value={valueProp}
                onClick={onClick}
                $css={{ display: 'grid', gridTemplateAreas, gridTemplateColumns }}
            >
                <MenuPrimitives.RadioItemIndicatorPrimitive $css={{ gridArea: 'marker' }}>
                    <ConfirmOutlineIcon />
                </MenuPrimitives.RadioItemIndicatorPrimitive>

                <checkItemSlots.leading render={leading} $css={{ gridArea: 'leading' }} />
                <checkItemSlots.label render={label} $css={{ gridArea: 'label' }} />
                <checkItemSlots.trailing render={trailing} $css={{ gridArea: 'trailing' }} />
            </MenuPrimitives.RadioItemPrimitive>
        );
    }

    const { value, handleValueChange } = context;

    return (
        <MenuPrimitives.CheckboxItemPrimitive
            closeOnClick
            checked={value.includes(valueProp)}
            onCheckedChange={() => handleValueChange(valueProp)}
            onClick={onClick}
            $css={{ display: 'grid', gridTemplateAreas, gridTemplateColumns }}
        >
            <MenuPrimitives.CheckboxItemIndicatorPrimitive $css={{ gridArea: 'marker' }}>
                <ConfirmOutlineIcon />
            </MenuPrimitives.CheckboxItemIndicatorPrimitive>

            <checkItemSlots.leading render={leading} $css={{ gridArea: 'leading' }} />
            <checkItemSlots.label render={label} $css={{ gridArea: 'label' }} />
            <checkItemSlots.trailing render={trailing} $css={{ gridArea: 'trailing' }} />
        </MenuPrimitives.CheckboxItemPrimitive>
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
     * 항목 좌측에 표시되는 요소. 레이블을 보충 설명하기 위한 요소를 배치한다.
     */
    leading?: CheckItemSlots['leading'];

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

const submenuItemSlots = createSlots({
    leading: Box,
    label: Box,
});

export const MenuSubmenuItem = ({ leading, label }: MenuSubmenuItem.Props) => {
    const gridTemplateAreas = `"${leading ? 'leading' : ''} label trailing"`;
    const gridTemplateColumns = `${leading ? 'auto' : ''} 1fr auto`;

    return (
        <MenuPrimitives.SubmenuTriggerItem
            $css={{ display: 'grid', gridTemplateAreas, gridTemplateColumns }}
        >
            <submenuItemSlots.leading render={leading} $css={{ gridArea: 'leading' }} />
            <submenuItemSlots.label render={label} $css={{ gridArea: 'label' }} />
        </MenuPrimitives.SubmenuTriggerItem>
    );
};

type SubmenuItemSlots = SlotProps<typeof submenuItemSlots>;

export interface MenuSubmenuItemProps {
    /**
     * 항목 좌측에 표시되는 요소. 레이블을 보충 설명하기 위한 요소를 배치한다.
     */
    leading?: SubmenuItemSlots['leading'];

    /**
     * 항목의 텍스트 라벨.
     */
    label: SubmenuItemSlots['label'];
}

export namespace MenuSubmenuItem {
    export type Props = MenuSubmenuItemProps;
}

/* -----------------------------------------------------------------------------------------------*/

export const Separator = () => {
    return (
        <MenuPrimitives.Separator
            $css={{
                display: {
                    default: 'block',
                    _firstChild: 'none',
                    _lastChild: 'none',
                    _adjacentToSeparator: 'none',
                },
            }}
        />
    );
};
