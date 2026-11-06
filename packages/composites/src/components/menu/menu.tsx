import { createContext, forwardRef, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import { Box, Menu as MenuPrimitives, Text, VStack } from '@vapor-ui/core';
import { ChevronRightOutlineIcon, ConfirmOutlineIcon } from '@vapor-ui/icons';

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
    trigger: MenuPrimitives.SubmenuTrigger,
});

export const MenuRoot = forwardRef<HTMLDivElement, MenuRoot.Props>((props, ref) => {
    const { modal, ...componentProps } = props;

    const parent = useMenuContext();
    const contextValue = useMemo<MenuContextValue>(() => ({ nested: true }), []);

    const menu =
        parent === undefined ? (
            <ParentMenu modal={modal} ref={ref} {...componentProps} />
        ) : (
            <Submenu ref={ref} {...componentProps} />
        );

    return <MenuContext.Provider value={contextValue}>{menu}</MenuContext.Provider>;
});
MenuRoot.displayName = 'Menu.Root';

type ParentMenuProps = MenuRoot.Props;

const ParentMenu = forwardRef<HTMLDivElement, ParentMenuProps>((props, ref) => {
    const {
        // functional
        open,
        defaultOpen,
        onOpenChange,
        modal,
        actionsRef,
        container,

        // DOM
        id,
        className,

        // variants
        side,
        align,

        // slots
        trigger,
        children,
    } = props;

    return (
        <MenuPrimitives.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            modal={modal}
            actionsRef={actionsRef}
        >
            <rootSlots.trigger render={trigger} />

            <MenuPrimitives.PortalPrimitive container={container}>
                <MenuPrimitives.PositionerPrimitive side={side} align={align}>
                    <MenuPrimitives.PopupPrimitive ref={ref} id={id} className={className}>
                        {children}
                    </MenuPrimitives.PopupPrimitive>
                </MenuPrimitives.PositionerPrimitive>
            </MenuPrimitives.PortalPrimitive>
        </MenuPrimitives.Root>
    );
});

type SubmenuProps = Omit<MenuRoot.Props, 'modal'>;

const Submenu = forwardRef<HTMLDivElement, SubmenuProps>((props, ref) => {
    const {
        // functional
        open,
        defaultOpen,
        onOpenChange,
        actionsRef,
        container,

        // DOM
        id,
        className,

        // variants
        side = 'right',
        align,

        // slots
        trigger,
        children,
    } = props;

    return (
        <MenuPrimitives.SubmenuRoot
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={onOpenChange}
            actionsRef={actionsRef}
        >
            <submenuSlots.trigger render={trigger} />

            <MenuPrimitives.PortalPrimitive container={container}>
                <MenuPrimitives.PositionerPrimitive side={side} sideOffset={8} align={align}>
                    <MenuPrimitives.SubmenuPopupPrimitive ref={ref} id={id} className={className}>
                        {children}
                    </MenuPrimitives.SubmenuPopupPrimitive>
                </MenuPrimitives.PositionerPrimitive>
            </MenuPrimitives.PortalPrimitive>
        </MenuPrimitives.SubmenuRoot>
    );
});

type RootSlots = SlotProps<typeof rootSlots | typeof submenuSlots>;
type RootProps = MenuPrimitives.Root.Props;
type PositionerProps = MenuPrimitives.PositionerPrimitive.Props;
type PortalProps = MenuPrimitives.PortalPrimitive.Props;
type PopupProps = MenuPrimitives.PopupPrimitive.Props;

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
     * Portal 대상 컨테이너. SSR·shadow DOM·특정 스택 컨텍스트에서 팝업 위치 제어가 필요할 때만 지정한다.
     * @default document.body
     */
    container?: PortalProps['container'];

    /**
     * 트리거를 기준으로 팝업이 열리는 방향.
     * 최상위 `Menu.Root`에서는 `"bottom"`, 중첩 `Menu.Root` (SubmenuItem 아래)에서는 `"right"`를 기본값으로 갖는다.
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
     * 메뉴 내부에 표시할 요소.
     */
    children: ReactNode;

    /**
     * Popup DOM 노드의 id. 최상위 `Menu.Root`는 Popup, 중첩 `Menu.Root`는 SubmenuPopup에 적용된다.
     */
    id?: PopupProps['id'];

    /**
     * Popup DOM 노드에 추가할 className.
     */
    className?: PopupProps['className'];
}

export namespace MenuRoot {
    export type Actions = MenuPrimitives.Root.Actions;
    export type Props = MenuRootProps;
}

/* -----------------------------------------------------------------------------------------------*/

const groupSlots = createSlots({
    label: MenuPrimitives.GroupLabel,
});

export const MenuGroup = forwardRef<HTMLDivElement, MenuGroup.Props>((props, ref) => {
    const { label, id, className, children } = props;

    return (
        <>
            <Separator />

            <MenuPrimitives.Group ref={ref} id={id} className={className}>
                <groupSlots.label render={label} />
                {children}
            </MenuPrimitives.Group>

            <Separator />
        </>
    );
});
MenuGroup.displayName = 'Menu.Group';

type GroupSlots = SlotProps<typeof groupSlots, 'label'>;
type GroupProps = MenuPrimitives.Group.Props;

export interface MenuGroupProps {
    /**
     * 그룹 상단에 표시되는 라벨. 스크린리더가 그룹 이름으로 낭독한다.
     */
    label: GroupSlots['label'];

    /**
     * 그룹 내부에 표시할 요소.
     */
    children: ReactNode;

    /**
     * 그룹 DOM 노드의 id.
     */
    id?: GroupProps['id'];

    /**
     * 그룹 DOM 노드에 추가할 className.
     */
    className?: GroupProps['className'];
}

export namespace MenuGroup {
    export type Props = MenuGroupProps;
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

export const MenuCheckGroup = forwardRef<HTMLDivElement, MenuCheckGroup.Props>((props, ref) => {
    if (props.mode === 'single') return <SingleCheckGroup {...props} ref={ref} />;
    return <MultipleCheckGroup {...props} ref={ref} />;
});
MenuCheckGroup.displayName = 'Menu.CheckGroup';

const SingleCheckGroup = forwardRef<HTMLDivElement, MenuSingleCheckGroupProps>((props, ref) => {
    const { value: valueProp, defaultValue, onValueChange, label, id, className, children } = props;

    const [value, setValueState] = useControlled<string | undefined>({
        name: 'MenuCheckGroup',
        controlled: valueProp,
        default: defaultValue ?? '',
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

            <MenuPrimitives.RadioGroup
                ref={ref}
                id={id}
                className={className}
                value={value}
                onValueChange={handleValueChange}
            >
                <checkGroupSlots.label render={label} />
                {children}
            </MenuPrimitives.RadioGroup>

            <Separator />
        </MenuCheckGroupContext.Provider>
    );
});

const MultipleCheckGroup = forwardRef<HTMLDivElement, MenuMultipleCheckGroupProps>((props, ref) => {
    const { value: valueProp, defaultValue, onValueChange, label, id, className, children } = props;

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

            <MenuPrimitives.Group ref={ref} id={id} className={className}>
                <checkGroupSlots.label render={label} />
                {children}
            </MenuPrimitives.Group>

            <Separator />
        </MenuCheckGroupContext.Provider>
    );
});

type CheckGroupSlots = SlotProps<typeof checkGroupSlots, 'label'>;

type RadioGroupProps = MenuPrimitives.RadioGroup.Props;
type CheckGroupMultipleProps = MenuPrimitives.Group.Props;

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
     * 단일 선택 그룹 DOM 노드의 id.
     */
    id?: RadioGroupProps['id'];

    /**
     * 단일 선택 그룹 DOM 노드에 추가할 className.
     */
    className?: RadioGroupProps['className'];

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
     * 다중 선택 그룹 DOM 노드의 id.
     */
    id?: CheckGroupMultipleProps['id'];

    /**
     * 다중 선택 그룹 DOM 노드에 추가할 className.
     */
    className?: CheckGroupMultipleProps['className'];

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

export const MenuItem = forwardRef<HTMLDivElement, MenuItem.Props>((props, ref) => {
    const { isDisabled, variant, label, description, leading, trailing, onClick, id, className } =
        props;

    return (
        <MenuPrimitives.Item
            ref={ref}
            id={id}
            className={className}
            disabled={isDisabled}
            onClick={onClick}
            $css={{
                color: variant === 'critical' ? '$fg-danger' : '$fg-normal',
                display: 'grid',
                ...getItemLayout({ hasLeading: !!leading, hasTrailing: !!trailing }),
                gap: '$000',
            }}
        >
            <ItemLayout
                leading={leading}
                label={label}
                description={description}
                trailing={trailing}
            />
        </MenuPrimitives.Item>
    );
});
MenuItem.displayName = 'Menu.Item';

type ItemProps = MenuPrimitives.Item.Props;

export interface MenuItemProps {
    /**
     * 메뉴 아이템 DOM 노드의 id.
     */
    id?: ItemProps['id'];

    /**
     * 메뉴 아이템 DOM 노드에 추가할 className.
     */
    className?: ItemProps['className'];

    /**
     * 항목 클릭 시 호출되는 이벤트 핸들러.
     * @example
     * <Menu.Item onClick={handleSelect} label="Copy" />
     */
    onClick: ItemProps['onClick'];

    /**
     * 아이템을 비활성화한다. 비활성화된 아이템은 클릭 시 액션을 실행하지 않는다.
     * @default false
     */
    isDisabled?: ItemProps['disabled'];

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
     * 항목 우측에 표시되는 요소. 단축키나 보조 아이콘 등을 배치한다.
     */
    trailing?: ItemSlots['trailing'];

    /**
     * 항목의 텍스트 라벨.
     */
    label: ItemSlots['label'];

    /**
     * 항목의 동작을 설명하는 텍스트.
     */
    description?: ItemSlots['description'];
}

export namespace MenuItem {
    export type Props = MenuItemProps;
}

/* -----------------------------------------------------------------------------------------------*/

export const MenuCheckItem = forwardRef<HTMLDivElement, MenuCheckItem.Props>((props, ref) => {
    const {
        value: valueProp,
        isDisabled,
        onClick,
        leading,
        label,
        description,
        trailing,
        id,
        className,
    } = props;

    const context = useMenuCheckGroupContext();
    const { mode, hasSelection } = context;
    const itemLayout = getItemLayout({
        hasMarker: mode === 'multiple' ? true : hasSelection,
        hasLeading: !!leading,
        hasTrailing: !!trailing,
    });

    if (mode === 'single') {
        return (
            <MenuPrimitives.RadioItemPrimitive
                ref={ref}
                id={id}
                className={className}
                closeOnClick
                disabled={isDisabled}
                value={valueProp}
                onClick={onClick}
                $css={{ display: 'grid', gap: '$000', ...itemLayout }}
            >
                <MenuPrimitives.RadioItemIndicatorPrimitive
                    $css={{ gridArea: 'marker', marginRight: '$050' }}
                >
                    <ConfirmOutlineIcon />
                </MenuPrimitives.RadioItemIndicatorPrimitive>

                <ItemLayout
                    leading={leading}
                    label={label}
                    description={description}
                    trailing={trailing}
                />
            </MenuPrimitives.RadioItemPrimitive>
        );
    }

    const { value, handleValueChange } = context;
    const checked = value.includes(valueProp);
    const handleCheckedChange = () => handleValueChange(valueProp);

    return (
        <MenuPrimitives.CheckboxItemPrimitive
            ref={ref}
            id={id}
            className={className}
            disabled={isDisabled}
            checked={checked}
            onCheckedChange={handleCheckedChange}
            onClick={onClick}
            $css={{ display: 'grid', gap: '$000', ...itemLayout }}
        >
            <MenuPrimitives.CheckboxItemIndicatorPrimitive $css={{ gridArea: 'marker' }} />

            <ItemLayout
                leading={leading}
                label={label}
                description={description}
                trailing={trailing}
            />
        </MenuPrimitives.CheckboxItemPrimitive>
    );
});
MenuCheckItem.displayName = 'Menu.CheckItem';

type RadioItemProps = MenuPrimitives.RadioItemPrimitive.Props;
type CheckboxItemProps = MenuPrimitives.CheckboxItemPrimitive.Props;

export interface MenuCheckItemProps {
    /**
     * 체크 아이템 DOM 노드의 id.
     */
    id?: RadioItemProps['id'] | CheckboxItemProps['id'];

    /**
     * 체크 아이템 DOM 노드에 추가할 className.
     */
    className?: RadioItemProps['className'] | CheckboxItemProps['className'];

    /**
     * 항목이 대표하는 값. 그룹의 선택 상태 키로 사용된다.
     */
    value: string;

    /**
     * 아이템을 비활성화한다. 비활성화된 아이템은 클릭 시 액션을 실행하거나 선택되지 않는다.
     * @default false
     */
    isDisabled?: RadioItemProps['disabled'];

    /**
     * 항목 클릭 시 호출된다. 선택 토글은 그룹이 처리하므로, 추가 사이드이펙트가 필요한 경우에만 지정한다.
     * @example
     * <Menu.CheckItem onClick={handleClick} value="option-1" label="Option 1" />
     */
    onClick?: RadioItemProps['onClick'] | CheckboxItemProps['onClick'];

    /**
     * 항목 좌측에 표시되는 요소. 레이블을 보충 설명하기 위한 요소를 배치한다.
     */
    leading?: ItemSlots['leading'];

    /**
     * 항목의 텍스트 라벨.
     */
    label: ItemSlots['label'];

    /**
     * 항목의 동작을 설명하는 텍스트.
     */
    description?: ItemSlots['description'];

    /**
     * 항목 우측에 표시되는 요소. 단축키나 보조 아이콘 등을 배치한다.
     */
    trailing?: ItemSlots['trailing'];
}

export namespace MenuCheckItem {
    export type Props = MenuCheckItemProps;
}

/* -----------------------------------------------------------------------------------------------*/

export const MenuSubmenuItem = forwardRef<HTMLDivElement, MenuSubmenuItem.Props>((props, ref) => {
    const { isDisabled, leading, description, label, trailing, id, className } = props;

    const itemLayout = getItemLayout({
        hasLeading: !!leading,
        hasTrailing: !!trailing,
        indicator: 'auto',
    });

    return (
        <MenuPrimitives.SubmenuTrigger
            ref={ref}
            id={id}
            className={className}
            disabled={isDisabled}
            $css={{ display: 'grid', gap: '$000', ...itemLayout }}
        >
            <ItemLayout
                leading={leading}
                label={label}
                description={description}
                trailing={trailing}
            />

            <Box
                render={<ChevronRightOutlineIcon />}
                $css={{ color: '$fg-secondary', marginLeft: '$050' }}
            />
        </MenuPrimitives.SubmenuTrigger>
    );
});
MenuSubmenuItem.displayName = 'Menu.SubmenuItem';

type SubmenuItemProps = MenuPrimitives.SubmenuTrigger.Props;

export interface MenuSubmenuItemProps {
    /**
     * SubmenuTrigger DOM 노드의 id.
     */
    id?: SubmenuItemProps['id'];

    /**
     * SubmenuTrigger DOM 노드에 추가할 className.
     */
    className?: SubmenuItemProps['className'];

    /**
     * 아이템을 비활성화한다. 비활성화된 트리거는 메뉴를 열 수 없다.
     * @default false
     */
    isDisabled?: SubmenuItemProps['disabled'];

    /**
     * 항목 좌측에 표시되는 요소. 레이블을 보충 설명하기 위한 요소를 배치한다.
     */
    leading?: ItemSlots['leading'];

    /**
     * 항목의 텍스트 라벨.
     */
    label: ItemSlots['label'];

    /**
     * 항목의 동작을 설명하는 텍스트.
     */
    description?: ItemSlots['description'];

    /**
     * 항목 우측에 표시되는 요소. 단축키나 보조 아이콘 등을 배치한다.
     */
    trailing?: ItemSlots['trailing'];
}

export namespace MenuSubmenuItem {
    export type Props = MenuSubmenuItemProps;
}

/* -----------------------------------------------------------------------------------------------*/

const Separator = () => {
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

/* -----------------------------------------------------------------------------------------------*/

const itemSlots = createSlots({
    leading: Box,
    label: Box,
    description: Text,
    trailing: Box,
});

type ItemSlots = SlotProps<typeof itemSlots, 'label'>;
interface ItemLayoutProps extends ItemSlots {}

const ItemLayout = ({ leading, label, description, trailing }: ItemLayoutProps) => (
    <>
        <itemSlots.leading render={leading} $css={{ gridArea: 'leading', marginRight: '$075' }} />
        <VStack $css={{ gridArea: 'label' }}>
            <itemSlots.label render={label} />
            <itemSlots.description render={description} foreground="hint" typography="body3" />
        </VStack>
        <itemSlots.trailing render={trailing} $css={{ gridArea: 'trailing', marginLeft: '$150' }} />
    </>
);

interface ItemLayoutOptions {
    hasMarker?: boolean;
    markerColumn?: string;
    hasLeading: boolean;
    hasTrailing: boolean;
    indicator?: string;
}

const getItemLayout = ({
    hasMarker = false,
    markerColumn = '1.375rem',
    hasLeading,
    hasTrailing,
    indicator,
}: ItemLayoutOptions) => {
    const gridTemplateAreas = `"${hasMarker ? 'marker ' : ''}${hasLeading ? 'leading ' : ''}label${hasTrailing ? ' trailing' : ''}"`;
    const gridTemplateColumns = `${hasMarker ? markerColumn : ''} ${hasLeading ? 'auto' : ''} 1fr ${hasTrailing ? 'auto' : ''} ${indicator ? 'auto' : ''}`;

    return { gridTemplateAreas, gridTemplateColumns };
};
