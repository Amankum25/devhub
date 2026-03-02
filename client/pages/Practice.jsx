import { useState, useEffect } from 'react';
import { Search, Filter, ExternalLink, Building2, Tag, TrendingUp, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import usePageTitle from '@/hooks/use-page-title';

export default function Practice() {
  usePageTitle('Practice - LeetCode Problems');
  
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [solvedProblems, setSolvedProblems] = useState(() => {
    // Load solved problems from localStorage
    const saved = localStorage.getItem('leetcode-solved-problems');
    return saved ? JSON.parse(saved) : {};
  });

  // Fetch statistics
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch problems with filters
  useEffect(() => {
    fetchProblems();
  }, [difficulty, selectedCompany, selectedTopic, searchTerm, currentPage]);

  // Save solved problems to localStorage
  useEffect(() => {
    localStorage.setItem('leetcode-solved-problems', JSON.stringify(solvedProblems));
  }, [solvedProblems]);

  const toggleSolved = (slug) => {
    setSolvedProblems(prev => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  const fetchStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/practice/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const params = new URLSearchParams({
        page: currentPage,
        limit: 50,
      });
      
      if (difficulty !== 'all') params.append('difficulty', difficulty);
      if (selectedCompany !== 'all') params.append('company', selectedCompany);
      if (selectedTopic !== 'all') params.append('topic', selectedTopic);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${API_URL}/api/practice?${params}`);
      const data = await response.json();
      
      setProblems(data.problems);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProblems();
  };

  return (
    <div className="min-h-screen bg-[#0B0E1A]">
      <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#3BD671] to-emerald-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[#3BD671] to-emerald-400 shadow-2xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent mb-4">
            LeetCode Practice
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Company-wise curated problems to ace your coding interviews
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="bg-[#0E1120] border-[#252B40] hover:bg-[#141829] transition-all duration-300 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#3BD671] flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Solved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {Object.values(solvedProblems).filter(Boolean).length}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {((Object.values(solvedProblems).filter(Boolean).length / stats.total) * 100).toFixed(1)}% complete
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#0E1120] border-[#252B40] hover:bg-[#141829] transition-all duration-300 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  Total Problems
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#0E1120] border-[#252B40] hover:bg-[#141829] transition-all duration-300 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Easy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.byDifficulty?.Easy || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#0E1120] border-[#252B40] hover:bg-[#141829] transition-all duration-300 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Medium
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.byDifficulty?.Medium || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#0E1120] border-[#252B40] hover:bg-[#141829] transition-all duration-300 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Hard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.byDifficulty?.Hard || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8 bg-[#0E1120] border-[#252B40] shadow-xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search problems..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#141829] border-[#252B40] text-white placeholder:text-slate-400 focus:border-[#3BD671]"
                  />
                </div>
                <Button type="submit" className="btn-gradient text-[#0B0E1A]">
                  Search
                </Button>
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="bg-[#141829] border-[#252B40] text-white">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="bg-[#141829] border-[#252B40] text-white">
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-[300px]">
                    <SelectItem value="all">All Companies</SelectItem>
                    {stats?.topCompanies?.slice(0, 15).map((company) => (
                      <SelectItem key={company.name} value={company.name}>
                        {company.name} ({company.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger className="bg-[#141829] border-[#252B40] text-white">
                    <SelectValue placeholder="Topic" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white max-h-[300px]">
                    <SelectItem value="all">All Topics</SelectItem>
                    {stats?.topics?.slice(0, 30).map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Problems List */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="bg-[#0E1120] border-[#252B40]">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-slate-700/50" />
                  <Skeleton className="h-4 w-1/2 bg-slate-700/50" />
                </CardContent>
              </Card>
            ))
          ) : problems.length === 0 ? (
            <Card className="bg-[#0E1120] border-[#252B40] shadow-xl">
              <CardContent className="p-12 text-center">
                <p className="text-slate-300 text-lg mb-2">
                  No problems found. Try adjusting your filters or run the data fetcher script.
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Run: <code className="bg-[#141829] px-3 py-1 rounded text-[#3BD671] border border-[#252B40]">node scripts/fetch-leetcode-data.js</code>
                </p>
              </CardContent>
            </Card>
          ) : (
            problems.map((problem) => (
              <Card key={problem.slug} className="bg-[#0E1120] border-[#252B40] hover:bg-[#141829] hover:border-[#3BD671]/20 transition-all duration-300 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      <Checkbox
                        id={`solved-${problem.slug}`}
                        checked={solvedProblems[problem.slug] || false}
                        onCheckedChange={() => toggleSolved(problem.slug)}
                        className="h-5 w-5 border-2 border-[#3BD671]/50 data-[state=checked]:bg-[#3BD671] data-[state=checked]:border-[#3BD671]"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`${getDifficultyColor(problem.difficulty)} border font-semibold`}>
                          {problem.difficulty}
                        </Badge>
                        <a
                          href={problem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-lg font-semibold flex items-center gap-2 truncate transition-colors ${
                            solvedProblems[problem.slug] 
                              ? 'text-slate-400 line-through hover:text-slate-300' 
                              : 'text-white hover:text-[#3BD671]'
                          }`}
                        >
                          {problem.title}
                          <ExternalLink className="h-4 w-4 flex-shrink-0" />
                        </a>
                      </div>

                      {/* Companies */}
                      {problem.company && problem.company.length > 0 && (
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {problem.company.slice(0, 5).map((company, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-[#141829] text-[#3BD671]/80 border-[#252B40]">
                                {company}
                              </Badge>
                            ))}
                            {problem.company.length > 5 && (
                              <Badge variant="outline" className="text-xs bg-[#141829] text-slate-300 border-[#252B40]">
                                +{problem.company.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Topics */}
                      {problem.topics && problem.topics.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <Tag className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {problem.topics.slice(0, 6).map((topic, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30 border">
                                {topic}
                              </Badge>
                            ))}
                            {problem.topics.length > 6 && (
                              <Badge variant="secondary" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600 border">
                                +{problem.topics.length - 6}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && problems.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-[#0E1120] border-[#252B40] text-white hover:bg-[#141829] disabled:opacity-50"
            >
              Previous
            </Button>
            <span className="text-sm text-slate-300 px-4 py-2 bg-[#0E1120] rounded-lg border border-[#252B40]">
              Page <span className="font-semibold text-[#3BD671]">{currentPage}</span> of <span className="font-semibold text-[#3BD671]">{totalPages}</span>
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="bg-[#0E1120] border-[#252B40] text-white hover:bg-[#141829] disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
