import React, { useState } from 'react';
import { Search, Upload, FileText, Database, Sparkles, File, Check, Loader2, Menu, Settings, ChevronDown, ChevronUp, Trash2, Eye, FolderOpen, Clock, HardDrive } from 'lucide-react';

// Mock document database (simulating indexed files)
const initialIndexedFiles = [
  {
    id: 1,
    name: 'us_government_overview.pdf',
    type: 'pdf',
    size: 245000,
    indexedAt: '2024-01-15T10:30:00Z',
    chunkCount: 2,
    chunks: [
      { id: 'c1', content: 'The President of the United States is the head of state and head of government of the United States. The current president is Joe Biden, who assumed office on January 20, 2021, as the 46th president.', score: 0.96 },
      { id: 'c2', content: 'Presidential elections are held every four years. The president serves a maximum of two terms, each lasting four years, as established by the 22nd Amendment.', score: 0.72 },
    ]
  },
  {
    id: 2,
    name: 'world_leaders_2024.docx',
    type: 'docx',
    size: 128000,
    indexedAt: '2024-01-16T14:20:00Z',
    chunkCount: 2,
    chunks: [
      { id: 'c3', content: 'As of 2024, key world leaders include: Joe Biden (USA), Xi Jinping (China), Emmanuel Macron (France), Narendra Modi (India), and Olaf Scholz (Germany).', score: 0.91 },
      { id: 'c4', content: 'The role of president varies significantly across different countries. In the USA, the president holds executive power, while in some countries the role is largely ceremonial.', score: 0.68 },
    ]
  },
  {
    id: 3,
    name: 'political_history_notes.txt',
    type: 'txt',
    size: 45000,
    indexedAt: '2024-01-17T09:15:00Z',
    chunkCount: 2,
    chunks: [
      { id: 'c5', content: 'Donald Trump served as the 45th President of the United States from 2017 to 2021. He was succeeded by Joe Biden following the 2020 presidential election.', score: 0.89 },
      { id: 'c6', content: 'The United States has had 46 presidents since George Washington took office in 1789. The presidency has evolved significantly over more than two centuries.', score: 0.75 },
    ]
  },
  {
    id: 4,
    name: 'executive_branch_guide.pdf',
    type: 'pdf',
    size: 312000,
    indexedAt: '2024-01-18T16:45:00Z',
    chunkCount: 2,
    chunks: [
      { id: 'c7', content: 'The Executive Branch is headed by the President, who is both the chief executive of the federal government and the Commander-in-Chief of the armed forces.', score: 0.85 },
      { id: 'c8', content: 'The Vice President, currently Kamala Harris, serves as the second-highest executive official and assumes the presidency if the president is unable to serve.', score: 0.82 },
    ]
  },
  {
    id: 5,
    name: 'election_results_2020.pdf',
    type: 'pdf',
    size: 567000,
    indexedAt: '2024-01-19T11:00:00Z',
    chunkCount: 2,
    chunks: [
      { id: 'c9', content: 'The 2020 United States presidential election was held on November 3, 2020. Joe Biden won with 306 electoral votes against Donald Trump who received 232 electoral votes.', score: 0.87 },
      { id: 'c10', content: 'Voter turnout in 2020 was the highest in over a century, with approximately 159 million votes cast, representing about 66.8% of eligible voters.', score: 0.52 },
    ]
  },
];

// Generate contextual mock data based on query
const generateMockResults = (query, topK, topN, indexedFiles) => {
  const queryLower = query.toLowerCase();
  
  let allChunks = [];
  indexedFiles.forEach(doc => {
    doc.chunks.forEach(chunk => {
      let adjustedScore = chunk.score;
      if (queryLower.includes('president')) {
        if (chunk.content.toLowerCase().includes('president')) {
          adjustedScore = Math.min(chunk.score + 0.05, 0.99);
        }
      }
      allChunks.push({
        ...chunk,
        source: doc.name,
        docId: doc.id,
        score: adjustedScore
      });
    });
  });

  allChunks.sort((a, b) => b.score - a.score);
  const topChunks = allChunks.slice(0, topK);

  const docScores = {};
  topChunks.forEach(chunk => {
    if (!docScores[chunk.docId] || docScores[chunk.docId] < chunk.score) {
      docScores[chunk.docId] = chunk.score;
    }
  });

  let relevantDocs = Object.keys(docScores).map(docId => {
    const doc = indexedFiles.find(d => d.id === parseInt(docId));
    return {
      id: doc.id,
      name: doc.name,
      score: docScores[docId],
      preview: doc.chunks[0].content.substring(0, 120) + '...'
    };
  });
  relevantDocs.sort((a, b) => b.score - a.score);

  if (topN) {
    relevantDocs = relevantDocs.slice(0, topN);
  }

  let answer = '';
  
  if (queryLower.includes('president')) {
    answer = `Based on the retrieved documents from your knowledge base, here is the answer to your query:

**The current President of the United States is Joe Biden**, who took office on January 20, 2021, as the 46th president.

This information was retrieved from multiple sources in your knowledge base:

• us_government_overview.pdf (96% relevance) - Contains official information about the U.S. presidency
• world_leaders_2024.docx (91% relevance) - Lists current world leaders including the U.S. president
• political_history_notes.txt (89% relevance) - Provides historical context about presidential succession

The Vice President is Kamala Harris, who would assume the presidency if the president is unable to serve.

Retrieved ${topChunks.length} relevant chunks from ${relevantDocs.length} documents.`;
  } else {
    answer = `Based on the search through your knowledge base for "${query}":

Found ${topChunks.length} relevant passages across ${relevantDocs.length} documents.

The most relevant information comes from "${topChunks[0]?.source || 'unknown'}" with ${((topChunks[0]?.score || 0) * 100).toFixed(0)}% relevance.

Please review the chunks and documents in the sidebar for detailed information.`;
  }

  return { answer, chunks: topChunks, documents: relevantDocs };
};

export default function RAGSearchApp() {
  const [activeTab, setActiveTab] = useState('search');
  const [indexingView, setIndexingView] = useState('upload');
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState('5');
  const [topN, setTopN] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [indexedFiles, setIndexedFiles] = useState(initialIndexedFiles);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSearch = () => {
    if (!query.trim() || !topK) return;

    setIsLoading(true);
    setSearchResults(null);

    setTimeout(() => {
      const results = generateMockResults(query, parseInt(topK), topN ? parseInt(topN) : null, indexedFiles);
      setSearchResults(results);
      setIsLoading(false);
      setSidebarOpen(true);
    }, 1500);
  };

  const handleBackToHome = () => {
    setSearchResults(null);
    setQuery('');
    setShowAdvanced(false);
    setActiveTab('search');
    setIndexingView('upload');
    setSelectedFile(null);
  };

  const handleUpload = () => {
    if (!uploadedFile) return;
    setUploadStatus('uploading');
    setTimeout(() => {
      const newFile = {
        id: indexedFiles.length + 1,
        name: uploadedFile.name,
        type: uploadedFile.name.split('.').pop(),
        size: uploadedFile.size,
        indexedAt: new Date().toISOString(),
        chunkCount: Math.floor(Math.random() * 5) + 1,
        chunks: [
          { id: `new-${Date.now()}`, content: `Content from ${uploadedFile.name} has been indexed and is now searchable.`, score: 0.75 }
        ]
      };
      setIndexedFiles([...indexedFiles, newFile]);
      setUploadStatus('success');
      setTimeout(() => {
        setUploadStatus(null);
        setUploadedFile(null);
      }, 2000);
    }, 2000);
  };

  const handleDeleteFile = (fileId) => {
    setIndexedFiles(indexedFiles.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && /\.(pdf|txt|docx)$/i.test(file.name)) {
      setUploadedFile(file);
      setUploadStatus(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setUploadStatus(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.9) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (score >= 0.8) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (score >= 0.7) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (score >= 0.6) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  };

  const getFileIcon = (type) => {
    const colors = {
      pdf: 'text-red-400',
      docx: 'text-blue-400',
      txt: 'text-slate-400'
    };
    return colors[type] || 'text-slate-400';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const totalChunks = indexedFiles.reduce((sum, f) => sum + f.chunkCount, 0);
  const totalSize = indexedFiles.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 -z-10" />
      <div className="fixed inset-0 opacity-30 -z-10" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`
      }} />

      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo - clickable as Home button */}
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleBackToHome}
              title="Back to Home"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold tracking-tight">RAG Search Engine</span>
            </div>
            
            {/* Center: Tab navigation */}
            <div className="flex gap-1 p-1 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'search'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Search className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={() => setActiveTab('indexing')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'indexing'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                Indexing
              </button>
            </div>

            {/* Right side: spacer for balance */}
            <div className="w-48" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
        {activeTab === 'search' ? (
          <div className="flex gap-6">
            <div className={`flex-1 transition-all duration-300`}>
              {!searchResults && !isLoading && (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-6">
                      <Sparkles className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                      RAG-Powered Search
                    </h1>
                    <p className="text-slate-400 text-lg">Retrieve and generate answers from your knowledge base</p>
                    <p className="text-slate-500 text-sm mt-2">{indexedFiles.length} documents indexed • {totalChunks} chunks available</p>
                  </div>

                  <div className="w-full max-w-2xl space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                      <div className="relative flex items-center">
                        <Search className="absolute left-5 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter your search query..."
                          className="w-full pl-14 pr-32 py-5 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-lg transition-all"
                        />
                        <button
                          type="button"
                          onClick={handleSearch}
                          disabled={!query.trim()}
                          className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Search
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 mx-auto text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Advanced Settings
                      {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showAdvanced && (
                      <div className="flex gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-500 mb-1.5">Top K (chunks to retrieve)</label>
                          <input
                            type="number"
                            value={topK}
                            onChange={(e) => setTopK(e.target.value)}
                            min="1"
                            max="20"
                            className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-500 mb-1.5">Top N (documents to show)</label>
                          <input
                            type="number"
                            value={topN}
                            onChange={(e) => setTopN(e.target.value)}
                            min="1"
                            max="20"
                            placeholder="All"
                            className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {!showAdvanced && (topK !== '5' || topN) && (
                      <p className="text-center text-xs text-slate-600">
                        K={topK}{topN && `, N=${topN}`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                    <Loader2 className="w-16 h-16 text-indigo-400 animate-spin relative" />
                  </div>
                  <p className="mt-6 text-slate-400 text-lg">Searching knowledge base...</p>
                  <p className="mt-2 text-slate-500 text-sm">Retrieving top {topK} chunks...</p>
                </div>
              )}

              {searchResults && !isLoading && (
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className={`p-3 rounded-xl border transition-all ${
                        showAdvanced 
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                          : 'bg-slate-800 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title="Advanced Settings"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className={`p-3 rounded-xl border transition-all ${
                        sidebarOpen 
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                          : 'bg-slate-800 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title="Toggle Sidebar"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                  </div>

                  {showAdvanced && (
                    <div className="flex gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-medium text-slate-500">Top K</label>
                        <input
                          type="number"
                          value={topK}
                          onChange={(e) => setTopK(e.target.value)}
                          min="1"
                          max="20"
                          className="w-20 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50 text-white text-sm text-center focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-medium text-slate-500">Top N</label>
                        <input
                          type="number"
                          value={topN}
                          onChange={(e) => setTopN(e.target.value)}
                          min="1"
                          max="20"
                          placeholder="All"
                          className="w-20 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50 text-white text-sm text-center placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                      </div>
                      <span className="text-xs text-slate-600 self-center ml-2">
                        Press Search to apply
                      </span>
                    </div>
                  )}

                  <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                      </div>
                      <h2 className="text-xl font-semibold">Generated Answer</h2>
                    </div>
                    <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {searchResults.answer}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {searchResults && !isLoading && sidebarOpen && (
              <div className="w-96 space-y-4 transition-all duration-300">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    Queried Chunks
                    <span className="ml-auto text-sm font-normal text-slate-500">
                      {searchResults.chunks.length} results
                    </span>
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {searchResults.chunks.map((chunk, idx) => (
                      <div 
                        key={chunk.id} 
                        className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30 hover:border-indigo-500/30 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-700 text-xs text-slate-400">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-medium text-slate-400">{chunk.source}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(chunk.score)}`}>
                            {(chunk.score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{chunk.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                  <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <File className="w-5 h-5 text-purple-400" />
                    Relevant Documents
                    <span className="ml-auto text-sm font-normal text-slate-500">
                      {searchResults.documents.length} docs
                    </span>
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {searchResults.documents.map((doc, idx) => (
                      <div 
                        key={doc.id} 
                        className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30 hover:border-purple-500/30 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-700 text-xs text-slate-400">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-medium text-white">{doc.name}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(doc.score)}`}>
                            {(doc.score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2">{doc.preview}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Indexing Tab */
          <div className="max-w-4xl mx-auto">
            {/* Sub-navigation for Indexing */}
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => setIndexingView('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  indexingView === 'upload'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload New
              </button>
              <button
                onClick={() => setIndexingView('browse')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  indexingView === 'browse'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                Browse Indexed
                <span className="px-1.5 py-0.5 rounded text-xs bg-slate-700 text-slate-300">
                  {indexedFiles.length}
                </span>
              </button>
            </div>

            {indexingView === 'upload' ? (
              /* Upload View */
              <div className="flex flex-col items-center">
                <div className="text-center mb-8">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6">
                    <Upload className="w-10 h-10 text-purple-400" />
                  </div>
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Index Documents
                  </h1>
                  <p className="text-slate-400 text-lg">Upload files to add to your knowledge base</p>
                </div>

                <div className="w-full max-w-xl">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`relative p-8 rounded-2xl border-2 border-dashed transition-all duration-200 ${
                      isDragging
                        ? 'border-purple-500 bg-purple-500/10'
                        : uploadedFile
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.txt,.docx"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    <div className="flex flex-col items-center text-center">
                      {uploadedFile ? (
                        <>
                          <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30 mb-4">
                            <FileText className="w-8 h-8 text-green-400" />
                          </div>
                          <p className="text-lg font-medium text-white mb-1">{uploadedFile.name}</p>
                          <p className="text-sm text-slate-400">{formatFileSize(uploadedFile.size)}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setUploadStatus(null); }}
                            className="mt-4 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                          >
                            Remove file
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="p-3 rounded-xl bg-slate-700/50 mb-4">
                            <Upload className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-lg font-medium text-white mb-1">Drop files here or click to upload</p>
                          <p className="text-sm text-slate-400">Supports PDF, TXT, DOCX</p>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!uploadedFile || uploadStatus === 'uploading'}
                    className={`w-full mt-4 py-4 rounded-xl font-semibold text-lg transition-all ${
                      uploadStatus === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                    }`}
                  >
                    {uploadStatus === 'uploading' ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading & Indexing...
                      </span>
                    ) : uploadStatus === 'success' ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        Successfully Indexed!
                      </span>
                    ) : (
                      'Upload & Index Document'
                    )}
                  </button>

                  <div className="flex justify-center gap-4 mt-6">
                    {['PDF', 'TXT', 'DOCX'].map((format) => (
                      <span key={format} className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                        .{format.toLowerCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Browse View */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Indexed Documents</h1>
                    <p className="text-slate-400 text-sm">
                      {indexedFiles.length} documents • {totalChunks} chunks • {formatFileSize(totalSize)}
                    </p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/20">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{indexedFiles.length}</p>
                        <p className="text-xs text-slate-500">Documents</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Database className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{totalChunks}</p>
                        <p className="text-xs text-slate-500">Chunks</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-pink-500/20">
                        <HardDrive className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{formatFileSize(totalSize)}</p>
                        <p className="text-xs text-slate-500">Total Size</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File List */}
                <div className="space-y-3">
                  {indexedFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedFile?.id === file.id
                          ? 'bg-slate-800 border-indigo-500/50'
                          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                      }`}
                      onClick={() => setSelectedFile(selectedFile?.id === file.id ? null : file)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg bg-slate-700/50`}>
                            <FileText className={`w-5 h-5 ${getFileIcon(file.type)}`} />
                          </div>
                          <div>
                            <p className="font-medium text-white">{file.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <HardDrive className="w-3 h-3" />
                                {formatFileSize(file.size)}
                              </span>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Database className="w-3 h-3" />
                                {file.chunkCount} chunks
                              </span>
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(file.indexedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedFile(file); }}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded View */}
                      {selectedFile?.id === file.id && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <p className="text-sm font-medium text-slate-400 mb-3">Preview Chunks:</p>
                          <div className="space-y-2">
                            {file.chunks.map((chunk, idx) => (
                              <div key={chunk.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-slate-500">Chunk {idx + 1}</span>
                                  <span className="px-1.5 py-0.5 rounded text-xs bg-slate-700 text-slate-400">
                                    Score: {(chunk.score * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <p className="text-sm text-slate-300">{chunk.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {indexedFiles.length === 0 && (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No documents indexed yet</p>
                    <button
                      onClick={() => setIndexingView('upload')}
                      className="mt-4 px-4 py-2 rounded-lg text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Upload your first document →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 py-3 text-center text-sm text-slate-500 bg-slate-950/80 backdrop-blur-sm border-t border-slate-800/50">
        <span className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          API Health: OK — Mock Backend Active
        </span>
      </footer>
    </div>
  );
}