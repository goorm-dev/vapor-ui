'use client';

import { useEffect, useRef, useState } from 'react';

import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';

const packages = [
    {
        name: '@vapor-ui/core',
        desc: '최소한의 기능 제약, 최대한의 형태 커스텀이 가능한 React 컴포넌트 라이브러리',
    },
    {
        name: '@vapor-ui/icons',
        desc: 'Vapor 디자인 시스템을 구성하는 React 아이콘 라이브러리',
    },
    {
        name: '@vapor-ui/hooks',
        desc: 'Vapor 디자인 시스템을 구성하는 React 훅 라이브러리',
    },
];

const InstallSelector = () => {
    const [selected, setSelected] = useState([packages[0].name, packages[1].name]);
    const allPackageNames = packages.map((pkg) => pkg.name);
    const allChecked = selected.length === allPackageNames.length;
    const noneChecked = selected.length === 0;
    const isIndeterminate = !allChecked && !noneChecked;
    const selectAllRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = isIndeterminate;
        }
    }, [isIndeterminate]);

    const toggle = (pkg: string) => {
        setSelected((prev) =>
            prev.includes(pkg) ? prev.filter((p) => p !== pkg) : [...prev, pkg],
        );
    };

    const handleSelectAll = () => {
        if (allChecked) {
            setSelected([]);
        } else {
            setSelected(allPackageNames);
        }
    };

    return (
        <div>
            <table
                style={{
                    width: '100%',
                    marginBottom: '1.5rem',
                    borderCollapse: 'collapse',
                }}
            >
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                ref={selectAllRef}
                                checked={allChecked}
                                onChange={handleSelectAll}
                                aria-checked={isIndeterminate ? 'mixed' : allChecked}
                            />
                        </th>
                        <th style={{ textAlign: 'left' }}>Package</th>
                        <th style={{ textAlign: 'left' }}>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {packages.map((pkg) => (
                        <tr key={pkg.name}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selected.includes(pkg.name)}
                                    onChange={() => toggle(pkg.name)}
                                />
                            </td>
                            <td>
                                <code>{pkg.name}</code>
                            </td>
                            <td>{pkg.desc}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h4>설치 명령어</h4>
            <Tabs items={['npm', 'pnpm', 'yarn', 'bun']}>
                <Tab value="npm">
                    <CodeBlock allowCopy>
                        <Pre className="px-4">{`npm install ${selected.join(' ')}`}</Pre>
                    </CodeBlock>
                </Tab>
                <Tab value="pnpm">
                    <CodeBlock allowCopy>
                        <Pre className="px-4">{`pnpm add ${selected.join(' ')}`}</Pre>
                    </CodeBlock>
                </Tab>
                <Tab value="yarn">
                    <CodeBlock allowCopy>
                        <Pre className="px-4">{`yarn add ${selected.join(' ')}`}</Pre>
                    </CodeBlock>
                </Tab>
                <Tab value="bun">
                    <CodeBlock allowCopy>
                        <Pre className="px-4">{`bun add ${selected.join(' ')}`}</Pre>
                    </CodeBlock>
                </Tab>
            </Tabs>
        </div>
    );
};

export default InstallSelector;
