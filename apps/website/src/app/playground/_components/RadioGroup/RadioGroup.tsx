// import * as Radix from '@radix-ui/react-radio-group';
// import cn from 'classnames';
// import {
//     createContext,
//     PropsWithChildren,
//     ReactNode,
//     useContext,
//     useId,
// } from 'react';

// import styles from './RadioGroup.module.scss';
// import { Label as VaporLabel, LabelProps } from '@goorm-dev/vapor-core';

// export type RadioGroupContextState = {
//     id: string;
//     size: 'md' | 'lg';
//     invalid: boolean;
// };

// const RadioGroupContext = createContext<RadioGroupContextState>({
//     id: '',
//     size: 'md',
//     invalid: false,
// });

// export const RadioGroupProvider = ({
//     children,
//     size,
//     invalid,
// }: PropsWithChildren<Omit<RadioGroupContextState, 'id'>>) => {
//     const id = useId();
//     return (
//         <RadioGroupContext.Provider value={{ id, size, invalid }}>
//             {children}
//         </RadioGroupContext.Provider>
//     );
// };

// export const useRadioGroupContext = () => {
//     const context = useContext(RadioGroupContext);
//     if (context === null) {
//         throw new Error(
//             'useRadioGroupContext must be used within a RadioGroupProvider',
//         );
//     }
//     return context;
// };

// export type RadioGroupProps = Omit<
//     Radix.RadioGroupProps,
//     'orientation' | 'defaultValue' | 'value' | 'onValueChange'
// > & {
//     size?: 'md' | 'lg';
//     invalid?: boolean;
//     direction?: 'horizontal' | 'vertical';
//     children: ReactNode;
//     defaultValue?: string;
//     value?: string;
//     onValueChange?: (value: string) => void;
// };

// const RadioGroup = ({
//     size = 'md',
//     invalid = false,
//     value,
//     defaultValue = '',
//     onValueChange,
//     direction,
//     children,
//     ...props
// }: RadioGroupProps) => {
//     return (
//         <RadioGroupProvider size={size} invalid={invalid}>
//             <Radix.RadioGroup
//                 value={value}
//                 defaultValue={defaultValue}
//                 onValueChange={onValueChange}
//                 orientation={direction}
//                 disabled={false}
//                 className={cn(
//                     styles.radioGroup,
//                     styles[`radioGroup_${direction}`],
//                     styles[`radioGroup_${direction}_${size}`],
//                 )}
//                 {...props}
//             >
//                 {children}
//             </Radix.RadioGroup>
//         </RadioGroupProvider>
//     );
// };

// /******************************************************************/

// const Label = ({ children, ...props }: LabelProps) => {
//     const { id } = useRadioGroupContext();

//     return (
//         <VaporLabel
//             typography="body2"
//             color="text-normal"
//             htmlFor={id}
//             {...props}
//         >
//             {children}
//         </VaporLabel>
//     );
// };
