function App() {
    const createRectangle = () => {
        parent.postMessage({ pluginMessage: { type: 'create-rectangle' } }, '*');
    };

    return (
        <main className="p-4">
            <h1 className="text-lg font-bold mb-4">내 플러그인</h1>
            <button
                onClick={createRectangle}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
                사각형 만들기
            </button>
        </main>
    );
}

export default App;
