import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const HomePageInterno: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [newsArticles, setNewsArticles] = useState<{ title: string; link: string }[]>([]);
  const [currencyRates, setCurrencyRates] = useState<{ USD: number; EUR: number; GBP: number }>({ USD: 0, EUR: 0, GBP: 0 });
  const [loadingNews, setLoadingNews] = useState<boolean>(true);
  const [loadingRates, setLoadingRates] = useState<boolean>(true);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Função para salvar dados em cache com validade de 24 horas
  const saveToCache = (key: string, data: any) => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const cacheData = { data, expiry: expiry.toISOString() };
    localStorage.setItem(key, JSON.stringify(cacheData));
  };

  // Função para obter dados do cache
  const getFromCache = (key: string) => {
    const cacheData = localStorage.getItem(key);
    if (cacheData) {
      const parsedData = JSON.parse(cacheData);
      if (new Date(parsedData.expiry) > new Date()) {
        return parsedData.data;
      }
    }
    return null;
  };

  // Função para buscar notícias
  const fetchNews = async () => {
    setLoadingNews(true);
    const cachedNews = getFromCache('news');
    if (cachedNews) {
      setNewsArticles(cachedNews);
      setLoadingNews(false);
      return;
    }

    try {
      const NewsApiKey = import.meta.env.VITE_APP_NEWS_API_KEY;
      const response = await axios.get('https://newsdata.io/api/1/latest', {
        params: {
          apikey: NewsApiKey,
          q: 'logistica OR logisticas OR transporte OR transportes OR suprimentos OR suprimento OR carregamento OR carregamentos OR descarregamento OR descarregamentos',
          country: 'br',
          language: 'pt',
          category: 'technology,business',
          size: 5,
        },
      });

      const articles = response.data.results.map((article: { title: string; link: string; }) => ({
        title: article.title,
        link: article.link,
      }));

      setNewsArticles(articles);
      saveToCache('news', articles);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  // Função para buscar cotações de moedas individuais (USD/BRL, EUR/BRL, GBP/BRL)
  const fetchCurrencyRates = async () => {
    setLoadingRates(true);
    const cachedRates = getFromCache('currencyRates');
    if (cachedRates) {
      setCurrencyRates(cachedRates);
      setLoadingRates(false);
      return;
    }
    try {
      const ExchangeApiKey = import.meta.env.VITE_APP_EXCHANGE_API_KEY;
      const [usdResponse, eurResponse, gbpResponse] = await Promise.all([
        axios.get(`https://v6.exchangerate-api.com/v6/${ExchangeApiKey}/latest/USD`),
        axios.get(`https://v6.exchangerate-api.com/v6/${ExchangeApiKey}/latest/EUR`),
        axios.get(`https://v6.exchangerate-api.com/v6/${ExchangeApiKey}/latest/GBP`),
      ]);

      const newRates = {
        USD: usdResponse.data.conversion_rates.BRL,
        EUR: eurResponse.data.conversion_rates.BRL,
        GBP: gbpResponse.data.conversion_rates.BRL,
      };

      setCurrencyRates(newRates);
      saveToCache('currencyRates', newRates);
    } catch (error) {
      console.error('Erro ao buscar taxas de câmbio:', error);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchCurrencyRates();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow flex flex-col items-center p-6 md:p-12">
        <div className="w-full max-w-5xl">
          <h1 className="mb-7 text-black text-4xl font-extrabold text-left">
            Olá, {user ? user.nomecompleto : 'Visitante'}! 👋
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Faixa de Taxas de Câmbio */}
              <div className="bg-white py-8 px-4 rounded-lg shadow-md space-y-10 text-center border">
                <h2 className="text-2xl font-extrabold">Taxas de Câmbio</h2>
                {loadingRates ? (
                  <div className="flex justify-center items-center">
                    <AiOutlineLoading3Quarters className="animate-spin text-blue-500 text-4xl" />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row justify-around items-center space-y-4 sm:space-y-0">
                    {/* USD / BRL */}
                    <div className="text-center p-4 border rounded-lg shadow-md flex flex-col items-center">
                      <div className="flex items-center space-x-2">
                        {/* SVG do USD */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-8 h-8">
                          <mask id="circleFlagsUs0"><circle cx="256" cy="256" r="256" fill="#fff" /></mask>
                          <g mask="url(#circleFlagsUs0)">
                            <path fill="#eee" d="M256 0h256v64l-32 32l32 32v64l-32 32l32 32v64l-32 32l32 32v64l-256 32L0 448v-64l32-32l-32-32v-64z" />
                            <path fill="#d80027" d="M224 64h288v64H224Zm0 128h288v64H256ZM0 320h512v64H0Zm0 128h512v64H0Z" />
                            <path fill="#0052b4" d="M0 0h256v256H0Z" />
                            <path fill="#eee" d="m187 243l57-41h-70l57 41l-22-67zm-81 0l57-41H93l57 41l-22-67zm-81 0l57-41H12l57 41l-22-67zm162-81l57-41h-70l57 41l-22-67zm-81 0l57-41H93l57 41l-22-67zm-81 0l57-41H12l57 41l-22-67Zm162-82l57-41h-70l57 41l-22-67Zm-81 0l57-41H93l57 41l-22-67zm-81 0l57-41H12l57 41l-22-67Z" />
                          </g>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-8 h-8"><mask id="circleFlagsBr0"><circle cx="256" cy="256" r="256" fill="#fff" /></mask><g mask="url(#circleFlagsBr0)"><path fill="#6da544" d="M0 0h512v512H0z" /><path fill="#ffda44" d="M256 100.2L467.5 256L256 411.8L44.5 256z" /><path fill="#eee" d="M174.2 221a87 87 0 0 0-7.2 36.3l162 49.8a88.5 88.5 0 0 0 14.4-34c-40.6-65.3-119.7-80.3-169.1-52z" /><path fill="#0052b4" d="M255.7 167a89 89 0 0 0-41.9 10.6a89 89 0 0 0-39.6 43.4a181.7 181.7 0 0 1 169.1 52.2a89 89 0 0 0-9-59.4a89 89 0 0 0-78.6-46.8zM212 250.5a149 149 0 0 0-45 6.8a89 89 0 0 0 10.5 40.9a89 89 0 0 0 120.6 36.2a89 89 0 0 0 30.7-27.3A151 151 0 0 0 212 250.5z" /></g></svg>
                        <p className="text-sm font-semibold">USD / BRL</p>
                      </div>
                      <p className="text-2xl font-bold">{currencyRates.USD.toFixed(4)}</p>
                    </div>
                    {/* EUR / BRL */}
                    <div className="text-center p-4 border rounded-lg shadow-md flex flex-col items-center">
                      <div className="flex items-center space-x-2">
                        {/* SVG do EUR */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-8 h-8">
                          <mask id="circleFlagsEuropeanUnion0"><circle cx="256" cy="256" r="256" fill="#fff" /></mask>
                          <g mask="url(#circleFlagsEuropeanUnion0)">
                            <path fill="#0052b4" d="M0 0h512v512H0z" />
                            <path fill="#ffda44" d="m256 100.2l8.3 25.5H291l-21.7 15.7l8.3 25.6l-21.7-15.8l-21.7 15.8l8.3-25.6l-21.7-15.7h26.8zm-110.2 45.6l24 12.2l18.9-19l-4.2 26.5l23.9 12.2l-26.5 4.2l-4.2 26.5l-12.2-24l-26.5 4.3l19-19zM100.2 256l25.5-8.3V221l15.7 21.7l25.6-8.3l-15.8 21.7l15.8 21.7l-25.6-8.3l-15.7 21.7v-26.8zm45.6 110.2l12.2-24l-19-18.9l26.5 4.2l12.2-23.9l4.2 26.5l26.5 4.2l-24 12.2l4.3 26.5l-19-19zM256 411.8l-8.3-25.5H221l21.7-15.7l-8.3-25.6l21.7 15.8l21.7-15.8l-8.3 25.6l21.7 15.7h-26.8zm110.2-45.6l-24-12.2l-18.9 19l4.2-26.5l-23.9-12.2l26.5-4.2l4.2-26.5l12.2 24l26.5-4.3l-19 19zM411.8 256l-25.5 8.3V291l-15.7-21.7l-25.6 8.3l15.8-21.7l-15.8-21.7l25.6 8.3l15.7-21.7v26.8zm-45.6-110.2l-12.2 24l19 18.9l-26.5-4.2l-12.2 23.9l-4.2-26.5l-26.5-4.2l24-12.2l-4.3-26.5l19 19z" />
                          </g>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-8 h-8"><mask id="circleFlagsBr0"><circle cx="256" cy="256" r="256" fill="#fff" /></mask><g mask="url(#circleFlagsBr0)"><path fill="#6da544" d="M0 0h512v512H0z" /><path fill="#ffda44" d="M256 100.2L467.5 256L256 411.8L44.5 256z" /><path fill="#eee" d="M174.2 221a87 87 0 0 0-7.2 36.3l162 49.8a88.5 88.5 0 0 0 14.4-34c-40.6-65.3-119.7-80.3-169.1-52z" /><path fill="#0052b4" d="M255.7 167a89 89 0 0 0-41.9 10.6a89 89 0 0 0-39.6 43.4a181.7 181.7 0 0 1 169.1 52.2a89 89 0 0 0-9-59.4a89 89 0 0 0-78.6-46.8zM212 250.5a149 149 0 0 0-45 6.8a89 89 0 0 0 10.5 40.9a89 89 0 0 0 120.6 36.2a89 89 0 0 0 30.7-27.3A151 151 0 0 0 212 250.5z" /></g></svg>
                        <p className="text-sm font-semibold">EUR / BRL</p>
                      </div>
                      <p className="text-2xl font-bold">{currencyRates.EUR.toFixed(4)}</p>
                    </div>
                    {/* GBP / BRL */}
                    <div className="text-center p-4 border rounded-lg shadow-md flex flex-col items-center">
                      <div className="flex items-center space-x-2">
                        {/* SVG do GBP */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-8 h-8"><path fill="#2a5f9e" d="M22 60.3V46.5l-10.3 7.6c2.9 2.7 6.4 4.8 10.3 6.2m20 0c3.9-1.4 7.4-3.5 10.3-6.2L42 46.4v13.9M3.7 42c.3 1 .7 1.9 1.2 2.9L8.8 42H3.7m51.5 0l3.9 2.9c.4-.9.8-1.9 1.2-2.9h-5.1" /><path fill="#fff" d="M23.5 38H2.6c.3 1.4.7 2.7 1.1 4h5.1l-3.9 2.9c.8 1.7 1.7 3.2 2.8 4.7L18 42h4v2l-11.7 8.6l1.4 1.4L22 46.5v13.8c1.3.5 2.6.8 4 1.1V38h-2.5m37.9 0H38v23.4c1.4-.3 2.7-.7 4-1.1V46.5L52.3 54c1.4-1.3 2.6-2.7 3.8-4.2L45.4 42h6.8l6.1 4.5c.3-.5.6-1.1.8-1.6L55.2 42h5.1c.4-1.3.8-2.6 1.1-4" /><path fill="#ed4c5c" d="M7.7 49.6c.8 1.1 1.6 2.1 2.5 3.1L22 44.1v-2h-4L7.7 49.6M45.5 42l10.7 7.8c.4-.5.7-1 .8-1.5c.1-.1.1-.2.2-.2c.3-.5.7-1.1 1-1.6L52.2 42h-6.7" /><path fill="#2a5f9e" d="M42 3.7v13.8l10.3-7.6C49.4 7.2 45.9 5.1 42 3.7m-20 0c-3.9 1.4-7.4 3.5-10.3 6.2L22 17.6V3.7M60.3 22c-.3-1-.7-1.9-1.2-2.9L55.2 22h5.1M8.8 22l-3.9-2.9c-.4 1-.8 1.9-1.2 2.9h5.1" /><path fill="#fff" d="M40.5 26h20.8c-.3-1.4-.7-2.7-1.1-4h-5.1l3.9-2.9c-.8-1.7-1.7-3.2-2.8-4.7L46 22h-4v-2l11.7-8.6l-1.4-1.4L42 17.5V3.7c-1.3-.5-2.6-.8-4-1.1V26h2.5M2.6 26H26V2.6c-1.4.3-2.7.7-4 1.1v13.8L11.7 10c-1.4 1.3-2.6 2.7-3.8 4.2L18.6 22h-6.8l-6.1-4.5c-.3.5-.6 1.1-.8 1.6L8.8 22H3.7c-.4 1.3-.8 2.6-1.1 4" /><g fill="#ed4c5c"><path d="M56.3 14.4c-.8-1.1-1.6-2.1-2.5-3.1L42 19.9v2h4l10.3-7.5M18.5 22L7.9 14.2c-.4.5-.7 1-1.1 1.5c-.1.1-.1.2-.2.2c-.3.5-.7 1.1-1 1.6l6.1 4.5h6.8" /><path d="M61.4 26H38V2.6c-1.9-.4-3.9-.6-6-.6s-4.1.2-6 .6V26H2.6c-.4 1.9-.6 3.9-.6 6s.2 4.1.6 6H26v23.4c1.9.4 3.9.6 6 .6s4.1-.2 6-.6V38h23.4c.4-1.9.6-3.9.6-6s-.2-4.1-.6-6" /></g></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-8 h-8"><mask id="circleFlagsBr0"><circle cx="256" cy="256" r="256" fill="#fff" /></mask><g mask="url(#circleFlagsBr0)"><path fill="#6da544" d="M0 0h512v512H0z" /><path fill="#ffda44" d="M256 100.2L467.5 256L256 411.8L44.5 256z" /><path fill="#eee" d="M174.2 221a87 87 0 0 0-7.2 36.3l162 49.8a88.5 88.5 0 0 0 14.4-34c-40.6-65.3-119.7-80.3-169.1-52z" /><path fill="#0052b4" d="M255.7 167a89 89 0 0 0-41.9 10.6a89 89 0 0 0-39.6 43.4a181.7 181.7 0 0 1 169.1 52.2a89 89 0 0 0-9-59.4a89 89 0 0 0-78.6-46.8zM212 250.5a149 149 0 0 0-45 6.8a89 89 0 0 0 10.5 40.9a89 89 0 0 0 120.6 36.2a89 89 0 0 0 30.7-27.3A151 151 0 0 0 212 250.5z" /></g></svg>
                        <p className="text-sm font-semibold">GBP / BRL</p>
                      </div>
                      <p className="text-2xl font-bold">{currencyRates.GBP.toFixed(4)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Botão de Conta */}
              <div
                onClick={() => handleNavigation('/conta')}
                className="bg-logisync-color-blue-400 text-white p-4 rounded-lg flex flex-col items-center hover:bg-logisync-color-blue-200 transition duration-300 cursor-pointer"
              >
                <FaUser className="mb-4 size-12" />
                <span className="text-2xl">Acessar Sua Conta</span>
              </div>
            </div>

            {/* Principais Notícias */}
            <div className="bg-white p-6 rounded-lg shadow-md md:col-span-1">
              <h2 className="text-xl font-extrabold mb-2">Principais Notícias</h2>
              {loadingNews ? (
                <div className="flex justify-center items-center h-40">
                  <AiOutlineLoading3Quarters className="animate-spin text-blue-500 text-4xl" />
                </div>
              ) : (
                <ul className="space-y-4">
                  {newsArticles.map((article, index) => (
                    <li key={index} className="flex flex-col space-y-1">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        {article.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageInterno;
