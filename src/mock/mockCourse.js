// Exemplo de estrutura de curso para testes locais
export const mockCourse = {
  id: 'curso1',
  titulo: 'Curso de Direito Digital',
  descricao: 'Aprenda os fundamentos do Direito Digital com especialistas.',
  modulos: [
    {
      id: 'mod1',
      titulo: 'Introdução ao Direito Digital',
      aulas: [
        {
          id: 'aula1',
          titulo: 'O que é Direito Digital?',
          descricao: 'Conceitos básicos e importância do Direito Digital.',
          videoUrl: 'https://www.youtube.com/embed/ysz5S6PUM-U',
        },
        {
          id: 'aula2',
          titulo: 'Legislação Brasileira',
          descricao: 'Principais leis e marcos regulatórios.',
          videoUrl: 'https://www.youtube.com/embed/9bZkp7q19f0',
        },
      ],
    },
    {
      id: 'mod2',
      titulo: 'Proteção de Dados',
      aulas: [
        {
          id: 'aula3',
          titulo: 'LGPD na Prática',
          descricao: 'Como a LGPD afeta empresas e advogados.',
          videoUrl: 'https://www.youtube.com/embed/3fumBcKC6RE',
        },
      ],
    },
  ],
};
