import React, { useState, useEffect, useCallback, useRef } from "react";

// ===================== DESIGN TOKENS =====================
const C = {
  bg: "#ECF0E8",
  card: "#20342A",
  cardSoft: "#2A4234",
  ink: "#1C2921",
  inkSoft: "#4A5A50",
  paper: "#F8F7F2",
  gold: "#C8A96E",
  goldDeep: "#A8894E",
  cream: "#EFE9DA",
  ok: "#4C7A5E",
  okSoft: "#9FD3AE",
  bad: "#B4552D",
  line: "#D7DDD2",
};

const FONT_HEAD = "'Fraunces', Georgia, serif";
const FONT_BODY = "'Inter', -apple-system, sans-serif";

// ===================== CONTEÚDO =====================
const COMMON_FIXES = [
  { wrong: "\"I will attend you\"", right: "\"I'll be right with you.\"", note: "Atender = to help / to assist. \"Attend\" é comparecer (a evento)." },
  { wrong: "\"payment receive\"", right: "\"payment method\" · \"card receipt\"", note: "Via de pagamento = payment method. Via do cartão = card receipt / customer copy." },
  { wrong: "\"Thanks for your preference\"", right: "\"Thank you for choosing us!\"", note: "Tradução literal de \"obrigado pela preferência\" — não é natural em inglês." },
  { wrong: "\"recipe\" para receita de óculos", right: "\"prescription\"", note: "Recipe é receita de comida. Grau/receita óptica = prescription." },
];

const LEVELS = [
  {
    id: 1,
    grade: "+0.50",
    name: "Júnior",
    tag: "Atendimento completo de balcão · vocabulário essencial",
    desc: "Domine o vocabulário e as frases para conduzir um atendimento Júnior inteiro — da recepção à despedida, incluindo o que o cliente fala. Ao fechar a prova, você está apto a atender sozinho.",
    sections: [
      {
        title: "Recepção",
        lines: [
          { sp: "cust", en: "Hello! Do you speak English?", pt: "Olá! Você fala inglês?" },
          { sp: "you", en: "A little, yes! Welcome! How can I help you?", pt: "Um pouco, sim! Bem-vindo! Como posso ajudar?" },
          { sp: "cust", en: "I'm looking for new glasses.", pt: "Estou procurando óculos novos." },
          { sp: "you", en: "Great! Please, come in.", pt: "Ótimo! Entre, por favor." },
          { sp: "you", en: "I'll be right with you.", pt: "Já vou te atender." },
        ],
      },
      {
        title: "Descobrindo a necessidade",
        lines: [
          { sp: "you", en: "Are you looking for glasses or sunglasses?", pt: "Você procura óculos de grau ou de sol?" },
          { sp: "cust", en: "Sunglasses, please.", pt: "De sol, por favor." },
          { sp: "you", en: "Do you have your prescription?", pt: "Você tem sua receita?" },
          { sp: "cust", en: "No, but I have my old glasses.", pt: "Não, mas tenho meus óculos antigos." },
          { sp: "you", en: "May I see your glasses?", pt: "Posso ver seus óculos?" },
          { sp: "cust", en: "Sure, here you go.", pt: "Claro, aqui está." },
          { sp: "you", en: "Thank you. One moment, please.", pt: "Obrigado. Um momento, por favor." },
        ],
      },
      {
        title: "Preço e pagamento",
        lines: [
          { sp: "cust", en: "How much is this one?", pt: "Quanto custa este?" },
          { sp: "you", en: "This frame looks great on you. The total is five hundred reais.", pt: "Essa armação ficou ótima em você. O total é quinhentos reais." },
          { sp: "cust", en: "Can I pay by card?", pt: "Posso pagar no cartão?" },
          { sp: "you", en: "Of course! Debit or credit?", pt: "Claro! Débito ou crédito?" },
          { sp: "cust", en: "Credit, please. Do you take installments?", pt: "Crédito, por favor. Vocês parcelam?" },
          { sp: "you", en: "Yes, in up to ten installments.", pt: "Sim, em até dez vezes." },
          { sp: "you", en: "Here's your receipt.", pt: "Aqui está seu comprovante." },
        ],
      },
      {
        title: "Prazo e despedida",
        lines: [
          { sp: "cust", en: "When will my glasses be ready?", pt: "Quando meus óculos ficam prontos?" },
          { sp: "you", en: "Your glasses will be ready on Friday.", pt: "Seus óculos ficarão prontos na sexta." },
          { sp: "cust", en: "Perfect. Thank you very much!", pt: "Perfeito. Muito obrigado!" },
          { sp: "you", en: "Thank you for choosing us! Have a great day!", pt: "Obrigado pela preferência! Tenha um ótimo dia!" },
        ],
      },
      {
        title: "Small talk e educação",
        lines: [
          { sp: "cust", en: "Excuse me, are you open?", pt: "Com licença, vocês estão abertos?" },
          { sp: "you", en: "Yes, we're open! Come in, please.", pt: "Sim, estamos abertos! Entre, por favor." },
          { sp: "cust", en: "What time do you close?", pt: "Que horas vocês fecham?" },
          { sp: "you", en: "We close at six p.m.", pt: "Fechamos às seis da tarde." },
          { sp: "you", en: "Please, have a seat. Would you like some water?", pt: "Sente-se, por favor. Aceita uma água?" },
          { sp: "cust", en: "Yes, please. Thank you!", pt: "Sim, por favor. Obrigado!" },
          { sp: "you", en: "You're welcome!", pt: "De nada!" },
          { sp: "cust", en: "Where are you from?", pt: "De onde você é?" },
          { sp: "you", en: "I'm from Brasília! And you?", pt: "Sou de Brasília! E você?" },
          { sp: "cust", en: "We're from Kazakhstan.", pt: "Somos do Cazaquistão." },
          { sp: "you", en: "Welcome to Brazil! I hope you're enjoying the city.", pt: "Bem-vindos ao Brasil! Espero que estejam gostando da cidade." },
        ],
      },
      {
        title: "Perguntas que você vai ouvir",
        lines: [
          { sp: "cust", en: "Do you take cash?", pt: "Vocês aceitam dinheiro?" },
          { sp: "you", en: "Yes, we do.", pt: "Sim, aceitamos." },
          { sp: "cust", en: "Is there a discount for cash?", pt: "Tem desconto à vista?" },
          { sp: "you", en: "Yes, ten percent off.", pt: "Sim, dez por cento de desconto." },
          { sp: "cust", en: "Can you write down the price?", pt: "Pode anotar o preço?" },
          { sp: "you", en: "Of course, here it is.", pt: "Claro, aqui está." },
          { sp: "cust", en: "Do you have this in black?", pt: "Tem este em preto?" },
          { sp: "you", en: "Let me check for you.", pt: "Deixa eu verificar para você." },
          { sp: "cust", en: "Can I try this one?", pt: "Posso experimentar este?" },
          { sp: "you", en: "Sure, go ahead!", pt: "Claro, fique à vontade!" },
          { sp: "cust", en: "Sorry, can you speak more slowly?", pt: "Desculpa, pode falar mais devagar?" },
          { sp: "you", en: "Of course, no problem.", pt: "Claro, sem problema." },
          { sp: "cust", en: "Do you have something cheaper?", pt: "Tem algo mais barato?" },
          { sp: "you", en: "Yes, let me show you our promotions.", pt: "Sim, deixa eu te mostrar nossas promoções." },
          { sp: "cust", en: "I'll think about it.", pt: "Vou pensar." },
          { sp: "you", en: "No problem! We're here every day.", pt: "Sem problema! Estamos aqui todos os dias." },
        ],
      },
    ],
    vocab: [
      ["atender (cliente)", "to help / to assist"],
      ["receita (de grau)", "prescription"],
      ["armação", "frame"],
      ["lente(s)", "lens / lenses"],
      ["comprovante", "receipt"],
      ["dinheiro / à vista", "cash"],
      ["parcelas", "installments"],
      ["desconto", "discount"],
    ],
    quiz: [
      // Prova situacional que certifica um atendimento Júnior completo, etapa por etapa.
      { q: "Um cliente entra e você ainda está terminando outro atendimento. O que dizer?", opts: ["\"Wait there!\"", "\"I'll be right with you.\"", "\"I go attend you.\"", "\"Stay, please.\""], a: 1, note: "\"To attend\" é comparecer a um evento; atender = to help / to assist." },
      { q: "São 15h e um cliente entra na loja. Como você recebe?", opts: ["\"Good night! Welcome.\"", "\"Good afternoon! Welcome. How can I help you?\"", "\"Good morning! What you want?\"", "\"Hi, we close now.\""], a: 1 },
      { q: "Você quer deixar o cliente à vontade enquanto busca as opções.", opts: ["\"Sit down now.\"", "\"Please, have a seat. Would you like some water?\"", "\"You rest there.\"", "\"Give me a moment to sit.\""], a: 1 },
      { q: "Você quer entender para que ele vai usar os óculos.", opts: ["\"Why you need glasses?\"", "\"What will you use them for?\"", "\"For what is the glasses?\"", "\"What glasses do?\""], a: 1 },
      { q: "Hora do cadastro. Como você pede o nome soletrado?", opts: ["\"Spell your name now.\"", "\"Could you spell your name, please?\"", "\"How write your name?\"", "\"Say your name letters.\""], a: 1 },
      { q: "Você precisa do contato do cliente.", opts: ["\"What's your phone number?\"", "\"Give me your phone.\"", "\"Which is your number phone?\"", "\"Your contact is what?\""], a: 0 },
      { q: "Ele não tem a receita, mas trouxe os óculos antigos. O que oferecer?", opts: ["\"Sorry, come back with the recipe.\"", "\"I can copy the prescription from your old lenses.\"", "\"I can make the receipt from your glasses.\"", "\"You need a new recipe first.\""], a: 1, note: "Receita óptica = prescription (recipe = receita de comida; receipt = comprovante)." },
      { q: "O cliente gostou de uma armação. Como convida a experimentar?", opts: ["\"Would you like to try it on?\"", "\"You want experiment this?\"", "\"Do you prove it?\"", "\"Try it in your face?\""], a: 0, note: "Experimentar (óculos/roupa) = to try on. \"To prove\" é provar/comprovar." },
      { q: "O cliente passa o dia no computador. O que recomendar?", opts: ["\"These lenses are for the sun only.\"", "\"These lenses filter blue light from screens.\"", "\"You don't need lenses for that.\"", "\"Buy sunglasses for the computer.\""], a: 1 },
      { q: "Você quer oferecer o tratamento antirreflexo.", opts: ["\"Do you want mirror lenses?\"", "\"Would you like anti-reflective coating?\"", "\"You need reflective glass?\"", "\"Want the reflection lenses?\""], a: 1 },
      { q: "Ao provar, ele diz: \"They feel a little too tight.\" O que você faz?", opts: ["Pede pra ele comprar um maior", "\"I can adjust them for you.\"", "Diz que é normal e ignora", "Diz que não dá pra fazer nada"], a: 1 },
      { q: "Ele pergunta o preço. Como responder o valor total?", opts: ["\"The price of it.\"", "\"The total is five hundred reais.\"", "\"It costs much money.\"", "\"Five hundred is the receipt.\""], a: 1 },
      { q: "Na hora de fechar, como pergunta a forma de pagamento?", opts: ["\"How you pay?\"", "\"How would you like to pay?\"", "\"What money you use?\"", "\"Which is your pay?\""], a: 1 },
      { q: "O cliente pergunta: \"Do you take installments?\" — o que ele quer saber?", opts: ["Se tem entrega", "Se pode parcelar", "Se aceita troca", "Se tem garantia"], a: 1 },
      { q: "Ele acha o valor alto. Qual a melhor resposta?", opts: ["\"It's not expensive.\"", "\"I understand. We have a cheaper option here.\"", "\"Then don't buy it.\"", "\"Everything is expensive.\""], a: 1 },
      { q: "Ele diz: \"I need to think about it.\" Boa resposta?", opts: ["\"You must decide now.\"", "\"No problem. Take your time.\"", "\"Why you don't want?\"", "\"The promotion ends today.\""], a: 1 },
      { q: "Como você informa o prazo de entrega?", opts: ["\"They'll be ready in three days.\"", "\"They stay ready three days.\"", "\"In three days they prompt.\"", "\"Ready will be three days.\""], a: 0 },
      { q: "Cliente: \"My glasses are broken.\" Melhor resposta?", opts: ["\"That's your problem.\"", "\"I'm sorry about that. We can repair them for you.\"", "\"Buy a new one.\"", "\"We don't fix glasses.\""], a: 1 },
      { q: "Cliente: \"Sorry, can you speak more slowly?\" — o que fazer?", opts: ["Repetir mais alto", "Falar mais devagar", "Chamar outro vendedor", "Trocar para português"], a: 1 },
      { q: "Melhor despedida ao final da venda?", opts: ["\"Thanks for your preference!\"", "\"Thank you for choosing us! Have a great day.\"", "\"Thanks for prefer us.\"", "\"Good preference, bye.\""], a: 1, note: "\"Thanks for your preference\" é tradução literal — não soa natural." },
    ],
  },
  {
    id: 2,
    grade: "+2.00",
    name: "Pleno",
    tag: "Atendimento completo · ≈850 palavras",
    desc: "A venda inteira com o cliente respondendo, perguntando e negociando: cadastro, cópia do grau, orçamento, objeção de preço, conserto e garantia.",
    sections: [
      {
        title: "Recepção e cadastro",
        lines: [
          { sp: "you", en: "Good afternoon! Welcome to Ótica VooX. My name is Alyson. How can I help you today?", pt: "Boa tarde! Bem-vindo à Ótica VooX. Meu nome é Alyson. Como posso ajudar?" },
          { sp: "cust", en: "Hi! I need new glasses. My old ones broke.", pt: "Oi! Preciso de óculos novos. Os antigos quebraram." },
          { sp: "you", en: "I'm sorry to hear that. Let's solve it! Have you shopped with us before?", pt: "Sinto muito. Vamos resolver! Você já comprou com a gente antes?" },
          { sp: "cust", en: "Yes, I bought glasses here last year.", pt: "Sim, comprei óculos aqui ano passado." },
          { sp: "you", en: "Great! Could you spell your name for me, please? I'll check your records.", pt: "Ótimo! Pode soletrar seu nome, por favor? Vou verificar seu cadastro." },
          { sp: "cust", en: "Sure. A-N-N-A, K-O-V-A-L.", pt: "Claro. A-N-N-A, K-O-V-A-L." },
          { sp: "you", en: "Found it! Here's your file, Anna.", pt: "Achei! Aqui está seu cadastro, Anna." },
        ],
      },
      {
        title: "Receita e medição",
        lines: [
          { sp: "you", en: "Do you have an up-to-date prescription?", pt: "Você tem uma receita atualizada?" },
          { sp: "cust", en: "No. Can you copy the prescription from my current lenses?", pt: "Não. Você consegue copiar o grau das minhas lentes atuais?" },
          { sp: "you", en: "Of course. I can measure your current lenses and copy your prescription.", pt: "Claro. Posso medir suas lentes atuais e copiar seu grau." },
          { sp: "cust", en: "How long does that take?", pt: "Quanto tempo demora?" },
          { sp: "you", en: "Just a few minutes. Please, have a seat.", pt: "Só alguns minutos. Sente-se, por favor." },
          { sp: "you", en: "Now let me take your measurements. Please look straight at me.", pt: "Agora vou tirar suas medidas. Olhe direto para mim, por favor." },
          { sp: "cust", en: "Like this?", pt: "Assim?" },
          { sp: "you", en: "Perfect. Done!", pt: "Perfeito. Pronto!" },
        ],
      },
      {
        title: "Escolha da armação",
        lines: [
          { sp: "you", en: "What style do you prefer — something classic or more modern?", pt: "Que estilo você prefere — algo clássico ou mais moderno?" },
          { sp: "cust", en: "Something modern, but not too big.", pt: "Algo moderno, mas não muito grande." },
          { sp: "you", en: "I have a few options for you. This one fits your face very well.", pt: "Tenho algumas opções. Essa se ajusta muito bem ao seu rosto." },
          { sp: "cust", en: "I like it. Do you have it in another color?", pt: "Gostei. Tem em outra cor?" },
          { sp: "you", en: "Yes, we have it in black, brown, and blue.", pt: "Sim, temos em preto, marrom e azul." },
          { sp: "cust", en: "This one feels heavy on my nose.", pt: "Esta está pesada no meu nariz." },
          { sp: "you", en: "Then let's try an acetate frame — it's much lighter.", pt: "Então vamos experimentar uma armação de acetato — é bem mais leve." },
        ],
      },
      {
        title: "Lentes e orçamento",
        lines: [
          { sp: "you", en: "For your prescription, I recommend these lenses with anti-reflective coating.", pt: "Para o seu grau, recomendo essas lentes com tratamento antirreflexo." },
          { sp: "cust", en: "Is the anti-reflective coating really necessary?", pt: "O antirreflexo é necessário mesmo?" },
          { sp: "you", en: "It reduces glare from screens and headlights, and your eyes look natural in photos. For daily use, it's worth it.", pt: "Ele reduz o reflexo de telas e faróis, e seus olhos ficam naturais nas fotos. Para uso diário, vale a pena." },
          { sp: "cust", en: "How much is everything?", pt: "Quanto fica tudo?" },
          { sp: "you", en: "The lenses are four hundred reais and the frame is three hundred, so the total comes to seven hundred.", pt: "As lentes são 400 reais e a armação 300, então o total fica em 700." },
          { sp: "cust", en: "That's more than I expected. Can you make it cheaper?", pt: "É mais do que eu esperava. Consegue fazer mais barato?" },
          { sp: "you", en: "If you pay in cash, I can offer a ten percent discount. Or you can split it in up to ten installments on your credit card.", pt: "À vista consigo dez por cento de desconto. Ou você pode parcelar em até dez vezes no cartão de crédito." },
          { sp: "cust", en: "Ten installments? With interest?", pt: "Dez vezes? Com juros?" },
          { sp: "you", en: "No interest at all.", pt: "Sem juros nenhum." },
          { sp: "cust", en: "OK, let's do the installments.", pt: "Certo, vamos parcelar." },
          { sp: "cust", en: "Do you accept Apple Pay?", pt: "Vocês aceitam Apple Pay?" },
          { sp: "you", en: "Yes, we accept contactless payments.", pt: "Sim, aceitamos pagamento por aproximação." },
          { sp: "you", en: "Great choice! Would you like the card receipt?", pt: "Ótima escolha! Gostaria da via do cartão?" },
        ],
      },
      {
        title: "Conserto rápido no balcão",
        lines: [
          { sp: "cust", en: "My glasses are broken. Can you fix them?", pt: "Meus óculos quebraram. Você consegue consertar?" },
          { sp: "you", en: "Let me see... The screw is missing. I can replace it right now, free of charge.", pt: "Deixa eu ver... O parafuso caiu. Posso trocar agora mesmo, sem custo." },
          { sp: "cust", en: "Really? That's great!", pt: "Sério? Que ótimo!" },
          { sp: "you", en: "The temple is also bent — I can adjust it for you.", pt: "A haste (chaleira) também está torta — posso ajustar para você." },
          { sp: "cust", en: "How much for the adjustment?", pt: "Quanto custa o ajuste?" },
          { sp: "you", en: "Nothing. Adjustments are free for our customers.", pt: "Nada. Ajustes são gratuitos para nossos clientes." },
        ],
      },
      {
        title: "Situação delicada: armação de outra loja",
        lines: [
          { sp: "cust", en: "I want to remake these glasses exactly the same.", pt: "Quero refazer esses óculos exatamente iguais." },
          { sp: "you", en: "Let me check... You bought the lenses from us, but the frame is from another store, so we don't carry that model.", pt: "Deixa eu verificar... As lentes você comprou conosco, mas a armação é de outra loja, então não trabalhamos com esse modelo." },
          { sp: "cust", en: "Oh no. So what can I do?", pt: "Ah não. E o que eu posso fazer?" },
          { sp: "you", en: "I can make the same lenses and help you choose a similar frame here. Would you like to see some options?", pt: "Posso fazer as mesmas lentes e te ajudar a escolher uma armação parecida aqui. Quer ver algumas opções?" },
        ],
      },
      {
        title: "Dúvidas que você vai ouvir",
        lines: [
          { sp: "cust", en: "Do these lenses scratch easily?", pt: "Essas lentes riscam fácil?" },
          { sp: "you", en: "No, they come with a scratch-resistant layer. Just clean them with the cloth we give you.", pt: "Não, elas vêm com camada antirrisco. É só limpar com a flanela que damos." },
          { sp: "cust", en: "My eyes hurt when I use my phone at night.", pt: "Meus olhos doem quando uso o celular à noite." },
          { sp: "you", en: "Then I recommend a blue light filter on your lenses. It makes screen time more comfortable.", pt: "Então recomendo o filtro de luz azul nas lentes. Deixa o tempo de tela mais confortável." },
          { sp: "cust", en: "How do I clean my glasses?", pt: "Como eu limpo meus óculos?" },
          { sp: "you", en: "Use water, neutral soap, and a soft cloth. Never use your shirt — it scratches the lenses.", pt: "Use água, sabão neutro e um pano macio. Nunca use a camiseta — ela risca as lentes." },
          { sp: "cust", en: "Do you sell contact lenses?", pt: "Vocês vendem lentes de contato?" },
          { sp: "you", en: "Yes, we do. But for contacts you need an up-to-date prescription.", pt: "Sim, vendemos. Mas para lentes de contato você precisa de receita atualizada." },
          { sp: "cust", en: "Can I swim with my glasses?", pt: "Posso nadar com meus óculos?" },
          { sp: "you", en: "Better not. Salt water and chlorine can damage the lens coating.", pt: "Melhor não. Água do mar e cloro podem danificar o tratamento da lente." },
          { sp: "cust", en: "My son needs glasses too. Do you have frames for kids?", pt: "Meu filho também precisa de óculos. Vocês têm armações infantis?" },
          { sp: "you", en: "Yes, we have flexible frames, perfect for children.", pt: "Sim, temos armações flexíveis, perfeitas para crianças." },
        ],
      },
      {
        title: "Troca e garantia",
        lines: [
          { sp: "cust", en: "What if the frame breaks?", pt: "E se a armação quebrar?" },
          { sp: "you", en: "The frame has a one-year warranty against manufacturing defects.", pt: "A armação tem um ano de garantia contra defeitos de fabricação." },
          { sp: "cust", en: "Can I exchange the frame if my wife doesn't like it?", pt: "Posso trocar a armação se minha esposa não gostar?" },
          { sp: "you", en: "Yes, within seven days, if it's in perfect condition.", pt: "Sim, em até sete dias, se estiver em perfeito estado." },
        ],
      },
      {
        title: "Óculos de sol com grau",
        lines: [
          { sp: "cust", en: "Can I have prescription sunglasses?", pt: "Posso ter óculos de sol com grau?" },
          { sp: "you", en: "Of course! We can make sunglasses with your prescription.", pt: "Claro! Podemos fazer óculos de sol com o seu grau." },
          { sp: "cust", en: "Do they protect against the sun?", pt: "Eles protegem do sol?" },
          { sp: "you", en: "Yes, all our sun lenses have full UV protection.", pt: "Sim, todas as nossas lentes solares têm proteção UV total." },
          { sp: "cust", en: "What do you recommend for driving?", pt: "O que você recomenda para dirigir?" },
          { sp: "you", en: "Polarized brown lenses. They cut the glare and improve contrast on the road.", pt: "Lentes polarizadas marrons. Elas cortam o reflexo e melhoram o contraste na estrada." },
        ],
      },
      {
        title: "Cliente ligando / WhatsApp",
        lines: [
          { sp: "cust", en: "Hello, is my order ready?", pt: "Olá, meu pedido está pronto?" },
          { sp: "you", en: "Good afternoon! Can you tell me your name, please?", pt: "Boa tarde! Pode me dizer seu nome, por favor?" },
          { sp: "you", en: "Let me check... Yes, your glasses arrived today. You can pick them up any time.", pt: "Deixa eu verificar... Sim, seus óculos chegaram hoje. Pode retirar a qualquer hora." },
          { sp: "cust", en: "Great! What time do you close?", pt: "Ótimo! Que horas vocês fecham?" },
          { sp: "you", en: "We close at six. See you soon!", pt: "Fechamos às seis. Até logo!" },
        ],
      },
      {
        title: "Entrega e ajuste final",
        lines: [
          { sp: "cust", en: "Hi, I came to pick up my glasses.", pt: "Oi, vim buscar meus óculos." },
          { sp: "you", en: "Welcome back! Here they are — please, try them on.", pt: "Bem-vindo de volta! Aqui estão — experimenta, por favor." },
          { sp: "cust", en: "It feels a little loose.", pt: "Está um pouco frouxo." },
          { sp: "you", en: "Let me adjust the temples for you... How about now?", pt: "Deixa eu ajustar as hastes... E agora?" },
          { sp: "cust", en: "Perfect, thank you!", pt: "Perfeito, obrigado!" },
          { sp: "you", en: "Remember: if you ever need an adjustment, it's always free.", pt: "Lembre-se: sempre que precisar de ajuste, é gratuito." },
        ],
      },
      {
        title: "Encerramento",
        lines: [
          { sp: "cust", en: "When will my glasses be ready?", pt: "Quando meus óculos ficam prontos?" },
          { sp: "you", en: "Your glasses will be ready in five business days. We'll message you on WhatsApp when they arrive.", pt: "Seus óculos ficam prontos em 5 dias úteis. Avisamos no WhatsApp quando chegarem." },
          { sp: "cust", en: "Do I need to bring anything to pick them up?", pt: "Preciso trazer algo para retirar?" },
          { sp: "you", en: "Just your receipt or your ID.", pt: "Só seu comprovante ou documento." },
          { sp: "you", en: "Thank you for choosing us! See you soon!", pt: "Obrigado pela preferência! Até logo!" },
        ],
      },
    ],
    vocab: [
      ["via do cartão", "card receipt / customer copy"],
      ["forma de pagamento", "payment method"],
      ["em até 10x sem juros", "in up to 10 interest-free installments"],
      ["dias úteis", "business days"],
      ["parafuso", "screw"],
      ["haste (\"chaleira\")", "temple / arm"],
      ["antirreflexo", "anti-reflective coating"],
      ["antirrisco", "scratch-resistant"],
      ["filtro de luz azul", "blue light filter"],
      ["garantia", "warranty"],
      ["sem custo", "free of charge"],
      ["soletrar", "to spell"],
    ],
    quiz: [
      { q: "\"Via do cartão\" em inglês:", opts: ["card way", "card receipt", "credit paper", "payment receive"], a: 1, note: "\"Payment receive\" não existe — foi o que você improvisou na vida real!" },
      { q: "\"Em até 10x no cartão de crédito\":", opts: ["\"in ten times on credit\"", "\"in up to ten installments on your credit card\"", "\"ten parcels in the card\"", "\"until ten payments of credit\""], a: 1 },
      { q: "\"Dias úteis\":", opts: ["useful days", "working times", "business days", "util days"], a: 2 },
      { q: "\"Parafuso\" em inglês:", opts: ["nail", "bolt pin", "screw", "spring"], a: 2 },
      { q: "A haste dos óculos (\"chaleira\") em inglês:", opts: ["kettle", "temple / arm", "leg", "handle"], a: 1, note: "\"Kettle\" é chaleira de cozinha, cuidado!" },
      { q: "\"Pode soletrar seu nome, por favor?\"", opts: ["\"Can you speak your name?\"", "\"Could you spell your name, please?\"", "\"Can you letter your name?\"", "\"Please say the letters of you.\""], a: 1 },
      { q: "Cliente sem receita. Como oferecer a cópia do grau?", opts: ["\"I can copy your recipe from the glass.\"", "\"I can measure your current lenses and copy your prescription.\"", "\"I take the grade of your lens.\"", "\"I can discover your degree.\""], a: 1 },
      { q: "\"Tratamento antirreflexo\":", opts: ["anti-shine layer", "no-reflex treatment", "anti-reflective coating", "reflection blocker"], a: 2 },
      { q: "Lente foi feita aqui, armação veio de outra loja. Melhor explicação:", opts: ["\"The lenses really you bought with us, but the frame in other store.\"", "\"You bought the lenses from us, but the frame is from another store, so we don't carry that model.\"", "\"Your frame is not ours, impossible.\"", "\"We only accept our frames here.\""], a: 1, note: "A opção 1 foi sua frase real — a ideia estava certa, a estrutura melhorou." },
      { q: "Cliente diz: \"Is the anti-reflective coating really necessary?\" — o que ele quer?", opts: ["Cancelar a compra", "Saber se o antirreflexo vale a pena", "Reclamar do preço", "Trocar a armação"], a: 1 },
      { q: "Cliente diz: \"Can you make it cheaper?\" — melhor resposta:", opts: ["\"No, the price is the price.\"", "\"If you pay in cash, I can offer a ten percent discount.\"", "\"Cheaper is impossible, sorry.\"", "\"You can buy other glasses.\""], a: 1, note: "Objeção de preço se responde com opções, não com \"não\"." },
      { q: "Cliente diz: \"My eyes hurt when I use my phone at night.\" — o que oferecer?", opts: ["Óculos de sol", "Filtro de luz azul", "Lentes de contato", "Desconto"], a: 1 },
    ],
  },
  {
    id: 3,
    grade: "+4.00",
    name: "Sênior",
    tag: "Consultivo · ≈1.200 palavras",
    desc: "Anamnese com respostas reais, condução ao exame, hospital dos óculos, escada de lentes até a Freeform, objeções, negociação, fechamento e pós-venda.",
    sections: [
      {
        title: "Anamnese",
        lines: [
          { sp: "you", en: "When was your last eye exam?", pt: "Quando foi seu último exame de vista?" },
          { sp: "cust", en: "About three years ago, I think.", pt: "Uns três anos atrás, eu acho." },
          { sp: "you", en: "Do you have more difficulty seeing far away or up close?", pt: "Você tem mais dificuldade para ver de longe ou de perto?" },
          { sp: "cust", en: "Up close. I have to hold my phone far from my face.", pt: "De perto. Tenho que segurar o celular longe do rosto." },
          { sp: "you", en: "How many hours a day do you spend on screens?", pt: "Quantas horas por dia você passa em telas?" },
          { sp: "cust", en: "Eight, maybe ten hours. I work at a computer all day.", pt: "Oito, talvez dez horas. Trabalho no computador o dia todo." },
          { sp: "you", en: "Do you get headaches or eye strain at the end of the day?", pt: "Você sente dor de cabeça ou cansaço visual no fim do dia?" },
          { sp: "cust", en: "Yes, almost every day. Especially in the evening.", pt: "Sim, quase todo dia. Principalmente à noite." },
          { sp: "you", en: "Do you drive at night? Do you notice glare from headlights?", pt: "Você dirige à noite? Percebe ofuscamento dos faróis?" },
          { sp: "cust", en: "I do. The lights bother me a lot.", pt: "Dirijo. As luzes me incomodam muito." },
          { sp: "you", en: "Thank you. This helps me recommend the perfect lenses for you.", pt: "Obrigado. Isso me ajuda a recomendar as lentes perfeitas para você." },
        ],
      },
      {
        title: "Condução ao exame de vista",
        lines: [
          { sp: "you", en: "Based on what you told me, I recommend an updated eye exam.", pt: "Com base no que você me contou, recomendo um exame de vista atualizado." },
          { sp: "cust", en: "Is it really necessary? My old prescription still works.", pt: "É necessário mesmo? Minha receita antiga ainda funciona." },
          { sp: "you", en: "Your symptoms suggest your prescription has changed. With an old prescription, your eyes work harder than they should — that's why you get headaches.", pt: "Seus sintomas sugerem que o grau mudou. Com receita antiga, seus olhos trabalham mais do que deviam — por isso as dores de cabeça." },
          { sp: "cust", en: "OK, that makes sense. How does it work?", pt: "Certo, faz sentido. Como funciona?" },
          { sp: "you", en: "We can schedule an appointment with the optometrist. It takes about twenty minutes.", pt: "Podemos agendar uma consulta com o optometrista. Leva uns vinte minutos." },
          { sp: "cust", en: "Can I do it today?", pt: "Posso fazer hoje?" },
          { sp: "you", en: "Let me check the schedule... Yes, in thirty minutes. Does that work for you?", pt: "Deixa eu ver a agenda... Sim, em trinta minutos. Fica bom para você?" },
        ],
      },
      {
        title: "Hospital dos óculos (manutenção)",
        lines: [
          { sp: "cust", en: "While I wait — can you look at my old glasses? They're crooked.", pt: "Enquanto eu espero — pode olhar meus óculos antigos? Estão tortos." },
          { sp: "you", en: "Of course. Let me examine them... The frame is bent and one nose pad is missing.", pt: "Claro. Deixa eu examinar... A armação está torta e falta uma plaqueta." },
          { sp: "you", en: "Our repair service — we call it the \"glasses hospital\" — can fix this.", pt: "Nosso serviço de manutenção — chamamos de \"hospital dos óculos\" — resolve isso." },
          { sp: "cust", en: "How long does it take?", pt: "Quanto tempo demora?" },
          { sp: "you", en: "Simple repairs are done on the spot. More complex ones take up to three business days.", pt: "Consertos simples são feitos na hora. Os mais complexos levam até 3 dias úteis." },
          { sp: "cust", en: "And how much does it cost?", pt: "E quanto custa?" },
          { sp: "you", en: "Adjustments are free if you bought your glasses with us.", pt: "Ajustes são gratuitos se você comprou seus óculos conosco." },
        ],
      },
      {
        title: "Lentes monofocais convencionais",
        lines: [
          { sp: "cust", en: "So, what are my options?", pt: "Então, quais são minhas opções?" },
          { sp: "you", en: "Let me explain, from the simplest to the most advanced. Single vision lenses correct one distance: either far or near.", pt: "Vou explicar, da mais simples à mais avançada. Lentes monofocais corrigem uma distância: ou longe, ou perto." },
          { sp: "you", en: "Conventional lenses are our entry-level option — good quality at the best price.", pt: "As convencionais são nossa opção de entrada — boa qualidade pelo melhor preço." },
          { sp: "cust", en: "So I would need two pairs? One for reading and one for distance?", pt: "Então eu precisaria de dois pares? Um pra leitura e um pra longe?" },
          { sp: "you", en: "Exactly — that's the limitation. That's why many people prefer progressives.", pt: "Exatamente — essa é a limitação. Por isso muita gente prefere as multifocais." },
        ],
      },
      {
        title: "Multifocais convencionais",
        lines: [
          { sp: "you", en: "Progressive lenses correct far, intermediate, and near vision in a single lens — with no visible line.", pt: "Lentes multifocais (progressivas) corrigem longe, meia distância e perto em uma só lente — sem linha visível." },
          { sp: "cust", en: "My friend bought progressives and got dizzy. Will that happen to me?", pt: "Minha amiga comprou multifocal e ficou tonta. Isso vai acontecer comigo?" },
          { sp: "you", en: "Great question. That usually happens with conventional progressives, because the visual fields are narrower and the adaptation takes longer.", pt: "Ótima pergunta. Isso costuma acontecer com as multifocais convencionais, porque os campos de visão são mais estreitos e a adaptação demora mais." },
          { sp: "cust", en: "So how do I avoid that?", pt: "E como eu evito isso?" },
          { sp: "you", en: "With better technology. Let me show you.", pt: "Com tecnologia melhor. Deixa eu te mostrar." },
        ],
      },
      {
        title: "Lentes digitais (mono e multi)",
        lines: [
          { sp: "you", en: "Digital lenses are surfaced with much higher precision than conventional ones.", pt: "Lentes digitais são surfaçadas com precisão muito maior que as convencionais." },
          { sp: "cust", en: "What does \"digital\" mean, exactly?", pt: "O que significa \"digital\", exatamente?" },
          { sp: "you", en: "The lens surface is calculated point by point by a computer, instead of using a fixed mold. The result is sharper vision and wider visual fields.", pt: "A superfície da lente é calculada ponto a ponto por computador, em vez de usar um molde fixo. O resultado é visão mais nítida e campos de visão mais amplos." },
        ],
      },
      {
        title: "Freeform (mono e multi)",
        lines: [
          { sp: "you", en: "And at the top, we have Freeform. These lenses are fully customized: we calculate them for your prescription, your frame, and the way you use your eyes.", pt: "E no topo, temos a Freeform. Essas lentes são totalmente personalizadas: calculamos para o seu grau, sua armação e o jeito que você usa os olhos." },
          { sp: "cust", en: "What's the real difference between digital and Freeform?", pt: "Qual a diferença real entre digital e Freeform?" },
          { sp: "you", en: "The Freeform is personalized. Two people with the same prescription get different lenses, because the calculation considers the distance between the lens and your eye, the angle of the frame, everything.", pt: "A Freeform é personalizada. Duas pessoas com o mesmo grau recebem lentes diferentes, porque o cálculo considera a distância entre a lente e o olho, o ângulo da armação, tudo." },
          { sp: "you", en: "It's our most advanced technology — maximum comfort, the widest fields, and the fastest adaptation.", pt: "É nossa tecnologia mais avançada — máximo conforto, os campos mais amplos e a adaptação mais rápida." },
          { sp: "cust", en: "Sounds good, but it must be expensive.", pt: "Parece bom, mas deve ser caro." },
          { sp: "you", en: "It's an investment. If you spend many hours on screens, you feel the difference on the first day.", pt: "É um investimento. Se você passa muitas horas em telas, sente a diferença no primeiro dia." },
        ],
      },
      {
        title: "Preços e negociação",
        lines: [
          { sp: "cust", en: "OK, let's talk numbers. How much is each option?", pt: "Certo, vamos falar de números. Quanto custa cada opção?" },
          { sp: "you", en: "The conventional progressive is six hundred reais, the digital is nine hundred, and the Freeform is one thousand four hundred.", pt: "A multifocal convencional sai por 600 reais, a digital por 900 e a Freeform por 1.400." },
          { sp: "cust", en: "One thousand four hundred? That's over my budget.", pt: "Mil e quatrocentos? Está acima do meu orçamento." },
          { sp: "you", en: "I understand. Let's look at it another way: you'll wear these lenses every day for about two years. The Freeform costs less than two reais a day for comfortable vision.", pt: "Entendo. Vamos olhar de outro jeito: você vai usar essas lentes todo dia por uns dois anos. A Freeform custa menos de dois reais por dia por uma visão confortável." },
          { sp: "cust", en: "Hmm. I saw cheaper prices online.", pt: "Hmm. Vi preços mais baratos na internet." },
          { sp: "you", en: "Online you buy a product. Here you get the measurements, the adjustment, the warranty, and me — if anything feels wrong, you come back and we fix it.", pt: "Na internet você compra um produto. Aqui você leva as medidas, o ajuste, a garantia e a mim — se algo estiver estranho, você volta e a gente resolve." },
          { sp: "cust", en: "Fair enough. Any discount?", pt: "Justo. Algum desconto?" },
          { sp: "you", en: "If you pay in cash, I can offer a ten percent discount. Or we can split it into twelve interest-free installments.", pt: "À vista consigo dez por cento de desconto. Ou podemos parcelar em 12x sem juros." },
        ],
      },
      {
        title: "Fechamento consultivo",
        lines: [
          { sp: "you", en: "Considering your screen time and night driving, the Freeform progressive is the best investment for you.", pt: "Considerando seu tempo de tela e a direção noturna, a multifocal Freeform é o melhor investimento para você." },
          { sp: "cust", en: "OK. And if I don't adapt?", pt: "Certo. E se eu não me adaptar?" },
          { sp: "you", en: "You have an adaptation guarantee. If you have any problem, come back and we'll take care of it.", pt: "Você tem garantia de adaptação. Qualquer problema, volta aqui e a gente cuida." },
          { sp: "you", en: "Shall we go ahead with this option?", pt: "Podemos fechar com essa opção?" },
          { sp: "cust", en: "Let's do it.", pt: "Vamos nessa." },
          { sp: "you", en: "Excellent choice! Freeform lenses are made to order, so they take seven business days.", pt: "Excelente escolha! As Freeform são feitas sob encomenda, então levam 7 dias úteis." },
          { sp: "you", en: "It was a pleasure helping you. Thank you for trusting us!", pt: "Foi um prazer atender você. Obrigado pela confiança!" },
        ],
      },
      {
        title: "Pós-venda: a entrega",
        lines: [
          { sp: "cust", en: "Hi, I'm here to pick up my glasses.", pt: "Oi, vim buscar meus óculos." },
          { sp: "you", en: "Welcome back! Here they are. Please, try them on.", pt: "Bem-vindo de volta! Aqui estão. Experimenta, por favor." },
          { sp: "cust", en: "Wow, everything is so sharp!", pt: "Uau, está tudo tão nítido!" },
          { sp: "you", en: "Move your head slowly and look around. In the first days, avoid looking down through the sides of the lenses.", pt: "Mexa a cabeça devagar e olhe ao redor. Nos primeiros dias, evite olhar para baixo pelas laterais das lentes." },
          { sp: "cust", en: "How long until I'm fully adapted?", pt: "Quanto tempo até eu me adaptar totalmente?" },
          { sp: "you", en: "Usually three to seven days. If anything feels wrong after that, come back and we'll check everything.", pt: "Normalmente de três a sete dias. Se algo estiver estranho depois disso, volta que a gente confere tudo." },
          { sp: "you", en: "Any questions, just call us. Enjoy your new glasses!", pt: "Qualquer dúvida, é só ligar. Aproveite seus óculos novos!" },
        ],
      },
    ],
    vocab: [
      ["anamnese", "patient history (intake questions)"],
      ["cansaço visual", "eye strain"],
      ["ofuscamento", "glare"],
      ["consulta", "appointment"],
      ["multifocal / progressiva", "progressive lenses"],
      ["campo de visão", "visual field"],
      ["adaptação", "adaptation"],
      ["orçamento (do cliente)", "budget"],
      ["sob encomenda", "made to order"],
      ["12x sem juros", "twelve interest-free installments"],
      ["garantia de adaptação", "adaptation guarantee"],
      ["fechar (a venda)", "to close / to go ahead"],
    ],
    quiz: [
      { q: "\"Cansaço visual\" em inglês:", opts: ["eye tiredness", "eye strain", "vision fatigue pain", "tired see"], a: 1 },
      { q: "\"Ofuscamento\" (dos faróis):", opts: ["shining", "blinding light", "glare", "flash"], a: 2 },
      { q: "\"Multifocal\" — termo mais comum em inglês:", opts: ["multifocal glass", "progressive lenses", "triple lenses", "many-focus lenses"], a: 1 },
      { q: "O grande diferencial da Freeform:", opts: ["\"It is the cheapest option.\"", "\"It is fully customized for your prescription and your frame.\"", "\"It never breaks.\"", "\"It has a visible line.\""], a: 1 },
      { q: "\"12x sem juros\":", opts: ["\"twelve times no tax\"", "\"twelve interest-free installments\"", "\"twelve parcels without juice\"", "\"twelve payments free\""], a: 1, note: "\"Juice\" é suco — juros = interest." },
      { q: "\"Sob encomenda\":", opts: ["under order", "made to order", "by demand make", "on request built"], a: 1 },
      { q: "\"Campo de visão\":", opts: ["vision camp", "field of look", "visual field", "sight area"], a: 2 },
      { q: "Como conduzir o cliente ao exame de vista?", opts: ["\"You need exam now.\"", "\"Your eyes are bad, go to doctor.\"", "\"I recommend an updated eye exam — we can schedule an appointment with the optometrist.\"", "\"First pay, after exam.\""], a: 2 },
      { q: "\"Podemos fechar (a venda)?\"", opts: ["\"Can we close?\"", "\"Shall we go ahead with this option?\"", "\"Do you finish buy?\"", "\"Let's lock the sale?\""], a: 1, note: "\"Can we close?\" soa como fechar a loja." },
      { q: "Cliente diz: \"My friend got dizzy with progressives. Will that happen to me?\" — qual é o medo dele?", opts: ["Preço alto demais", "Tontura na adaptação da multifocal", "A armação quebrar", "Perder a garantia"], a: 1 },
      { q: "Cliente diz: \"That's over my budget.\" — melhor reação:", opts: ["\"OK, goodbye.\"", "Reposicionar o valor (custo por dia) e oferecer condições", "Baixar o preço imediatamente", "Ignorar e continuar"], a: 1 },
      { q: "Cliente diz: \"I saw cheaper prices online.\" — o que fazer?", opts: ["Criticar as lojas online", "Mostrar o valor do serviço: medidas, ajuste, garantia e suporte", "Cobrir qualquer preço", "Dizer que internet é golpe"], a: 1 },
    ],
  },
];

const STORAGE_KEY = "voox-english-v3";
const passFor = (level) => Math.ceil(level.quiz.length * 0.8);

// Intervalos da repetição espaçada (ms)
const RATINGS = [
  { label: "De novo", sub: "1 min", color: C.bad, interval: 60 * 1000 },
  { label: "Difícil", sub: "10 min", color: "#B4842D", interval: 10 * 60 * 1000 },
  { label: "Fácil", sub: "1 dia", color: C.ok, interval: 24 * 60 * 60 * 1000 },
  { label: "Muito fácil", sub: "4 dias", color: "#2E6E4E", interval: 4 * 24 * 60 * 60 * 1000 },
];

// ===================== META DO DIA (ritmo da Fase 1) =====================
// Faixas do slider de termos NOVOS por dia. 300 termos ÷ 10/dia ≈ 30 dias.
const PACE_STOPS = [
  { v: 6,  label: "Rápido",      hint: "dose leve · ~50 dias" },
  { v: 8,  label: "Equilibrado", hint: "constante · ~38 dias" },
  { v: 10, label: "Ideal",       hint: "recomendado · ~30 dias" },
  { v: 12, label: "Arrojado",    hint: "puxado · ~25 dias" },
  { v: 15, label: "Lendário",    hint: "no limite · ~20 dias" },
];
const DEFAULT_DAILY = { pace: 10, streak: 0, bestStreak: 0, lastGoalDay: null, introduced: {} };

const ymd = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

// ===================== TERMOS DA FASE 1 (deck híbrido) =====================
// Vocabulário BÁSICO DE BALCÃO da ótica, cada termo ancorado numa frase curta de
// atendimento. Organizado por tema. role: "you" = vendedor · "cust" = cliente.
// Fase B em andamento: escalando até ~300. Mantenha frases curtas e naturais.
const FASE1_TERMS = [
  // ————— Recepção / Cumprimentos —————
  { key: "f1-rec-welcome",   theme: "Recepção",   role: "you",  term: "welcome",        termPt: "bem-vindo(a)",        phrase: "Welcome! How can I help you?",            phrasePt: "Bem-vindo! Como posso ajudar?" },
  { key: "f1-rec-help",      theme: "Recepção",   role: "you",  term: "to help",        termPt: "ajudar",              phrase: "How can I help you today?",               phrasePt: "Como posso te ajudar hoje?" },
  { key: "f1-rec-morning",   theme: "Recepção",   role: "you",  term: "good morning",   termPt: "bom dia",             phrase: "Good morning! Welcome to our store.",     phrasePt: "Bom dia! Bem-vindo à nossa loja." },
  { key: "f1-rec-afternoon", theme: "Recepção",   role: "you",  term: "good afternoon", termPt: "boa tarde",           phrase: "Good afternoon! Come in, please.",        phrasePt: "Boa tarde! Entre, por favor." },
  { key: "f1-rec-comein",    theme: "Recepção",   role: "you",  term: "to come in",     termPt: "entrar",              phrase: "Please, come in and take a look.",        phrasePt: "Por favor, entre e dê uma olhada." },
  { key: "f1-rec-course",    theme: "Recepção",   role: "you",  term: "of course",      termPt: "claro / com certeza", phrase: "Of course! I'll be right with you.",      phrasePt: "Claro! Já vou te atender." },
  { key: "f1-rec-moment",    theme: "Recepção",   role: "you",  term: "one moment",     termPt: "um momento",          phrase: "One moment, please.",                     phrasePt: "Um momento, por favor." },
  { key: "f1-rec-name",      theme: "Recepção",   role: "you",  term: "your name",      termPt: "seu nome",            phrase: "Could you tell me your name, please?",    phrasePt: "Pode me dizer seu nome, por favor?" },
  { key: "f1-rec-english",   theme: "Recepção",   role: "cust", term: "to speak English", termPt: "falar inglês",      phrase: "Do you speak English?",                   phrasePt: "Você fala inglês?" },
  { key: "f1-rec-alittle",   theme: "Recepção",   role: "you",  term: "a little",       termPt: "um pouco",            phrase: "A little, yes! How can I help?",          phrasePt: "Um pouco, sim! Como posso ajudar?" },

  // ————— Descobrindo a necessidade —————
  { key: "f1-need-look",     theme: "Necessidade", role: "you", term: "to look for",    termPt: "procurar",            phrase: "What are you looking for today?",         phrasePt: "O que você procura hoje?" },
  { key: "f1-need-glasses",  theme: "Necessidade", role: "cust", term: "glasses",       termPt: "óculos",              phrase: "I'm looking for new glasses.",            phrasePt: "Estou procurando óculos novos." },
  { key: "f1-need-sun",      theme: "Necessidade", role: "you", term: "sunglasses",     termPt: "óculos de sol",       phrase: "Glasses or sunglasses?",                  phrasePt: "Óculos de grau ou de sol?" },
  { key: "f1-need-reading",  theme: "Necessidade", role: "you", term: "reading glasses", termPt: "óculos de leitura",  phrase: "Do you need reading glasses?",            phrasePt: "Você precisa de óculos de leitura?" },
  { key: "f1-need-presc",    theme: "Necessidade", role: "you", term: "prescription",   termPt: "receita / grau",      phrase: "Do you have your prescription?",          phrasePt: "Você tem sua receita?" },
  { key: "f1-need-old",      theme: "Necessidade", role: "cust", term: "old glasses",   termPt: "óculos antigos",      phrase: "I have my old glasses with me.",          phrasePt: "Tenho meus óculos antigos comigo." },
  { key: "f1-need-see",      theme: "Necessidade", role: "you", term: "may I see",      termPt: "posso ver",           phrase: "May I see your glasses?",                 phrasePt: "Posso ver seus óculos?" },
  { key: "f1-need-forwhat",  theme: "Necessidade", role: "you", term: "to use for",     termPt: "usar para",           phrase: "What will you use them for?",             phrasePt: "Você vai usar para quê?" },
  { key: "f1-need-driving",  theme: "Necessidade", role: "cust", term: "for driving",   termPt: "para dirigir",        phrase: "Mostly for driving.",                     phrasePt: "Principalmente para dirigir." },
  { key: "f1-need-computer", theme: "Necessidade", role: "cust", term: "for the computer", termPt: "para o computador", phrase: "I need them for the computer.",          phrasePt: "Preciso deles para o computador." },

  // ————— Armação —————
  { key: "f1-frame-frame",   theme: "Armação",    role: "you",  term: "frame",          termPt: "armação",             phrase: "This frame looks great on you.",          phrasePt: "Essa armação ficou ótima em você." },
  { key: "f1-frame-fit",     theme: "Armação",    role: "you",  term: "to fit",         termPt: "servir / encaixar",   phrase: "This frame fits you very well.",          phrasePt: "Essa armação te serve muito bem." },
  { key: "f1-frame-light",   theme: "Armação",    role: "you",  term: "lightweight",    termPt: "leve",                phrase: "This frame is very lightweight.",         phrasePt: "Essa armação é bem leve." },
  { key: "f1-frame-color",   theme: "Armação",    role: "you",  term: "color",          termPt: "cor",                 phrase: "We have this frame in other colors.",     phrasePt: "Temos essa armação em outras cores." },
  { key: "f1-frame-size",    theme: "Armação",    role: "you",  term: "size",           termPt: "tamanho",             phrase: "What size do you usually wear?",          phrasePt: "Que tamanho você costuma usar?" },
  { key: "f1-frame-round",   theme: "Armação",    role: "you",  term: "round",          termPt: "redonda",             phrase: "Do you prefer round or square frames?",   phrasePt: "Você prefere armação redonda ou quadrada?" },
  { key: "f1-frame-metal",   theme: "Armação",    role: "you",  term: "metal",          termPt: "metal",               phrase: "This frame is made of metal.",            phrasePt: "Essa armação é de metal." },
  { key: "f1-frame-acetate", theme: "Armação",    role: "you",  term: "acetate",        termPt: "acetato",             phrase: "This one is acetate, very comfortable.",  phrasePt: "Essa é de acetato, bem confortável." },
  { key: "f1-frame-try",     theme: "Armação",    role: "you",  term: "to try on",      termPt: "experimentar",        phrase: "Would you like to try it on?",            phrasePt: "Gostaria de experimentar?" },
  { key: "f1-frame-mirror",  theme: "Armação",    role: "you",  term: "mirror",         termPt: "espelho",             phrase: "The mirror is right here.",               phrasePt: "O espelho está bem aqui." },
  { key: "f1-frame-suit",    theme: "Armação",    role: "you",  term: "to suit",        termPt: "cair bem / combinar", phrase: "This shape really suits your face.",       phrasePt: "Esse formato cai muito bem no seu rosto." },

  // ————— Lentes —————
  { key: "f1-lens-lens",     theme: "Lentes",     role: "you",  term: "lens",           termPt: "lente",               phrase: "This lens is very thin and light.",       phrasePt: "Essa lente é bem fina e leve." },
  { key: "f1-lens-ready",    theme: "Lentes",     role: "you",  term: "lenses",         termPt: "lentes (par)",        phrase: "Your lenses are ready.",                  phrasePt: "Suas lentes estão prontas." },
  { key: "f1-lens-thin",     theme: "Lentes",     role: "you",  term: "thin",           termPt: "fina",                phrase: "We can make the lenses thinner.",         phrasePt: "Podemos deixar as lentes mais finas." },
  { key: "f1-lens-single",   theme: "Lentes",     role: "you",  term: "single vision",  termPt: "visão simples",       phrase: "These are single vision lenses.",         phrasePt: "Essas são lentes de visão simples." },
  { key: "f1-lens-progr",    theme: "Lentes",     role: "you",  term: "progressive",    termPt: "multifocal",          phrase: "Do you need progressive lenses?",         phrasePt: "Você precisa de lentes multifocais?" },
  { key: "f1-lens-clean",    theme: "Lentes",     role: "you",  term: "to clean",       termPt: "limpar",              phrase: "Clean the lenses with this cloth.",       phrasePt: "Limpe as lentes com este paninho." },
  { key: "f1-lens-cloth",    theme: "Lentes",     role: "you",  term: "cleaning cloth", termPt: "paninho de limpeza",  phrase: "Here's a cleaning cloth for you.",        phrasePt: "Aqui está um paninho de limpeza para você." },
  { key: "f1-lens-clear",    theme: "Lentes",     role: "you",  term: "clear",          termPt: "transparente / nítida", phrase: "Your vision will be much clearer.",      phrasePt: "Sua visão vai ficar bem mais nítida." },

  // ————— Tratamentos —————
  { key: "f1-coat-coating",  theme: "Tratamentos", role: "you", term: "coating",        termPt: "tratamento / camada", phrase: "Would you like anti-reflective coating?", phrasePt: "Gostaria de tratamento antirreflexo?" },
  { key: "f1-coat-antiref",  theme: "Tratamentos", role: "you", term: "anti-reflective", termPt: "antirreflexo",       phrase: "Anti-reflective lenses reduce glare.",    phrasePt: "Lentes antirreflexo reduzem o reflexo." },
  { key: "f1-coat-blue",     theme: "Tratamentos", role: "you", term: "blue light",     termPt: "luz azul",            phrase: "These lenses filter blue light from screens.", phrasePt: "Essas lentes filtram a luz azul das telas." },
  { key: "f1-coat-scratch",  theme: "Tratamentos", role: "you", term: "scratch-resistant", termPt: "antirrisco",       phrase: "The coating is scratch-resistant.",       phrasePt: "O tratamento é antirrisco." },
  { key: "f1-coat-photo",    theme: "Tratamentos", role: "you", term: "photochromic",   termPt: "fotossensível",       phrase: "Photochromic lenses darken in the sun.",  phrasePt: "Lentes fotossensíveis escurecem no sol." },
  { key: "f1-coat-uv",       theme: "Tratamentos", role: "you", term: "UV protection",  termPt: "proteção UV",         phrase: "These lenses have full UV protection.",   phrasePt: "Essas lentes têm proteção UV total." },
  { key: "f1-coat-glare",    theme: "Tratamentos", role: "you", term: "glare",          termPt: "reflexo / ofuscamento", phrase: "This coating cuts glare at night.",     phrasePt: "Esse tratamento reduz o reflexo à noite." },

  // ————— Receita / Grau —————
  { key: "f1-presc-degree",  theme: "Receita",    role: "cust", term: "degree",         termPt: "grau",                phrase: "My degree is a little strong.",           phrasePt: "Meu grau é um pouco forte." },
  { key: "f1-presc-eye",     theme: "Receita",    role: "you",  term: "eye exam",       termPt: "exame de vista",      phrase: "When was your last eye exam?",            phrasePt: "Quando foi seu último exame de vista?" },
  { key: "f1-presc-doctor",  theme: "Receita",    role: "you",  term: "eye doctor",     termPt: "oftalmologista",      phrase: "You should see an eye doctor first.",     phrasePt: "Você deveria ver um oftalmologista primeiro." },
  { key: "f1-presc-updated", theme: "Receita",    role: "you",  term: "up to date",     termPt: "atualizada / em dia", phrase: "Is your prescription up to date?",        phrasePt: "Sua receita está atualizada?" },
  { key: "f1-presc-far",     theme: "Receita",    role: "cust", term: "farsighted",     termPt: "hipermetrope",        phrase: "I'm a little farsighted.",                phrasePt: "Sou um pouco hipermetrope." },
  { key: "f1-presc-near",    theme: "Receita",    role: "cust", term: "nearsighted",    termPt: "míope",               phrase: "I'm nearsighted, I can't see far.",       phrasePt: "Sou míope, não enxergo de longe." },

  // ————— Provar / Ajuste —————
  { key: "f1-try-look",      theme: "Provar",     role: "cust", term: "how do I look",  termPt: "como eu fiquei",      phrase: "How do I look with these?",               phrasePt: "Como eu fiquei com esses?" },
  { key: "f1-try-comfort",   theme: "Provar",     role: "you",  term: "comfortable",    termPt: "confortável",         phrase: "Are they comfortable on your nose?",      phrasePt: "Está confortável no seu nariz?" },
  { key: "f1-try-tight",     theme: "Provar",     role: "cust", term: "too tight",      termPt: "muito apertado",      phrase: "They feel a little too tight.",           phrasePt: "Estão um pouco apertados." },
  { key: "f1-try-adjust",    theme: "Provar",     role: "you",  term: "to adjust",      termPt: "ajustar",             phrase: "I can adjust them for you.",              phrasePt: "Posso ajustar para você." },
  { key: "f1-try-loose",     theme: "Provar",     role: "you",  term: "loose",          termPt: "frouxo / solto",      phrase: "If they feel loose, come back.",          phrasePt: "Se ficarem frouxos, volte aqui." },

  // ————— Preço e pagamento —————
  { key: "f1-pay-howmuch",   theme: "Pagamento",  role: "cust", term: "how much",       termPt: "quanto custa",        phrase: "How much is this one?",                   phrasePt: "Quanto custa este?" },
  { key: "f1-pay-total",     theme: "Pagamento",  role: "you",  term: "total",          termPt: "total",               phrase: "The total is five hundred reais.",        phrasePt: "O total é quinhentos reais." },
  { key: "f1-pay-price",     theme: "Pagamento",  role: "you",  term: "price",          termPt: "preço",               phrase: "The price includes the lenses.",          phrasePt: "O preço já inclui as lentes." },
  { key: "f1-pay-card",      theme: "Pagamento",  role: "cust", term: "to pay by card", termPt: "pagar no cartão",     phrase: "Can I pay by card?",                      phrasePt: "Posso pagar no cartão?" },
  { key: "f1-pay-debit",     theme: "Pagamento",  role: "you",  term: "debit or credit", termPt: "débito ou crédito",  phrase: "Debit or credit?",                        phrasePt: "Débito ou crédito?" },
  { key: "f1-pay-cash",      theme: "Pagamento",  role: "you",  term: "cash",           termPt: "dinheiro / à vista",  phrase: "Do you have a discount for cash?",        phrasePt: "Tem desconto à vista?" },
  { key: "f1-pay-install",   theme: "Pagamento",  role: "cust", term: "installments",   termPt: "parcelas",            phrase: "Do you take installments?",               phrasePt: "Vocês parcelam?" },
  { key: "f1-pay-discount",  theme: "Pagamento",  role: "you",  term: "discount",       termPt: "desconto",            phrase: "I can give you a small discount.",        phrasePt: "Posso te dar um pequeno desconto." },
  { key: "f1-pay-receipt",   theme: "Pagamento",  role: "you",  term: "receipt",        termPt: "comprovante",         phrase: "Here's your receipt.",                    phrasePt: "Aqui está seu comprovante." },

  // ————— Prazo e entrega —————
  { key: "f1-del-ready",     theme: "Entrega",    role: "you",  term: "to be ready",    termPt: "ficar pronto",        phrase: "They'll be ready in three days.",         phrasePt: "Ficam prontos em três dias." },
  { key: "f1-del-pickup",    theme: "Entrega",    role: "you",  term: "to pick up",     termPt: "retirar / buscar",    phrase: "You can pick them up on Friday.",         phrasePt: "Você pode retirar na sexta." },
  { key: "f1-del-call",      theme: "Entrega",    role: "you",  term: "to call",        termPt: "ligar / avisar",      phrase: "We'll call you when they're ready.",      phrasePt: "A gente te liga quando ficarem prontos." },
  { key: "f1-del-wait",      theme: "Entrega",    role: "cust", term: "to wait",        termPt: "esperar",             phrase: "How long do I have to wait?",             phrasePt: "Quanto tempo eu preciso esperar?" },

  // ————— Problemas / Troca / Garantia —————
  { key: "f1-prob-warranty", theme: "Garantia",   role: "you",  term: "warranty",       termPt: "garantia",            phrase: "The frame has a one-year warranty.",      phrasePt: "A armação tem um ano de garantia." },
  { key: "f1-prob-exchange", theme: "Garantia",   role: "you",  term: "to exchange",    termPt: "trocar",              phrase: "You can exchange them within seven days.", phrasePt: "Você pode trocar em até sete dias." },
  { key: "f1-prob-broken",   theme: "Garantia",   role: "cust", term: "broken",         termPt: "quebrado",            phrase: "My glasses are broken.",                  phrasePt: "Meus óculos estão quebrados." },
  { key: "f1-prob-repair",   theme: "Garantia",   role: "you",  term: "to repair",      termPt: "consertar",           phrase: "We can repair them for you.",             phrasePt: "Podemos consertar para você." },
  { key: "f1-prob-sorry",    theme: "Garantia",   role: "you",  term: "I'm sorry",      termPt: "sinto muito",         phrase: "I'm sorry about that. Let me help.",      phrasePt: "Sinto muito por isso. Deixa eu ajudar." },

  // ————— Small talk / rapport —————
  { key: "f1-st-howareyou",  theme: "Small talk", role: "you",  term: "how are you",    termPt: "como vai",            phrase: "Hello! How are you today?",               phrasePt: "Olá! Como vai você hoje?" },
  { key: "f1-st-meet",       theme: "Small talk", role: "you",  term: "nice to meet you", termPt: "prazer em conhecer", phrase: "Nice to meet you!",                       phrasePt: "Prazer em te conhecer!" },
  { key: "f1-st-seat",       theme: "Small talk", role: "you",  term: "to have a seat", termPt: "sentar-se",           phrase: "Please, have a seat.",                    phrasePt: "Por favor, sente-se." },
  { key: "f1-st-water",      theme: "Small talk", role: "you",  term: "water",          termPt: "água",                phrase: "Would you like some water?",              phrasePt: "Aceita uma água?" },
  { key: "f1-st-niceday",    theme: "Small talk", role: "you",  term: "nice day",       termPt: "dia bom",             phrase: "It's a nice day, isn't it?",              phrasePt: "Está um dia bom, não é?" },

  // ————— Cadastro e contato —————
  { key: "f1-reg-spell",     theme: "Cadastro",   role: "you",  term: "to spell",       termPt: "soletrar",            phrase: "Could you spell your name, please?",      phrasePt: "Pode soletrar seu nome, por favor?" },
  { key: "f1-reg-phone",     theme: "Cadastro",   role: "you",  term: "phone number",   termPt: "número de telefone",  phrase: "What's your phone number?",               phrasePt: "Qual é o seu telefone?" },
  { key: "f1-reg-whats",     theme: "Cadastro",   role: "you",  term: "WhatsApp",       termPt: "WhatsApp",            phrase: "Can I send it to your WhatsApp?",         phrasePt: "Posso enviar no seu WhatsApp?" },
  { key: "f1-reg-address",   theme: "Cadastro",   role: "you",  term: "address",        termPt: "endereço",            phrase: "What's your address?",                    phrasePt: "Qual é o seu endereço?" },
  { key: "f1-reg-email",     theme: "Cadastro",   role: "you",  term: "email",          termPt: "e-mail",              phrase: "Could I have your email, please?",        phrasePt: "Pode me passar seu e-mail?" },
  { key: "f1-reg-register",  theme: "Cadastro",   role: "you",  term: "to register",    termPt: "cadastrar",           phrase: "Let me register your information.",       phrasePt: "Deixa eu fazer seu cadastro." },

  // ————— Segunda via e exame —————
  { key: "f1-copy-copy",     theme: "Segunda via", role: "you", term: "to copy",        termPt: "copiar",              phrase: "I can copy the prescription from your old lenses.", phrasePt: "Posso copiar o grau das suas lentes antigas." },
  { key: "f1-copy-measure",  theme: "Segunda via", role: "you", term: "to measure",     termPt: "medir",               phrase: "Let me measure your current lenses.",     phrasePt: "Deixa eu medir suas lentes atuais." },
  { key: "f1-copy-schedule", theme: "Segunda via", role: "you", term: "to schedule",    termPt: "agendar",             phrase: "Would you like to schedule an eye test?", phrasePt: "Gostaria de agendar um exame de vista?" },
  { key: "f1-copy-appt",     theme: "Segunda via", role: "you", term: "appointment",    termPt: "horário / consulta",  phrase: "Your appointment is at three.",           phrasePt: "Seu horário é às três." },
  { key: "f1-copy-free",     theme: "Segunda via", role: "you", term: "free",           termPt: "gratuito / de graça", phrase: "We offer a free eye test.",               phrasePt: "Oferecemos um exame de vista grátis." },

  // ————— Acessórios —————
  { key: "f1-acc-case",      theme: "Acessórios", role: "you",  term: "case",           termPt: "estojo",              phrase: "The case comes with the glasses.",        phrasePt: "O estojo vem junto com os óculos." },
  { key: "f1-acc-strap",     theme: "Acessórios", role: "you",  term: "strap",          termPt: "cordinha",            phrase: "Would you like a strap for the kids?",    phrasePt: "Quer uma cordinha para as crianças?" },
  { key: "f1-acc-spray",     theme: "Acessórios", role: "you",  term: "lens spray",     termPt: "spray de limpeza",    phrase: "Use this spray to clean the lenses.",     phrasePt: "Use este spray para limpar as lentes." },
  { key: "f1-acc-kit",       theme: "Acessórios", role: "you",  term: "cleaning kit",   termPt: "kit de limpeza",      phrase: "This kit has a cloth and a spray.",       phrasePt: "Este kit tem um paninho e um spray." },
  { key: "f1-acc-extra",     theme: "Acessórios", role: "you",  term: "extra pair",     termPt: "par extra",           phrase: "Do you want an extra pair?",              phrasePt: "Quer um par extra?" },

  // ————— Crianças e esporte —————
  { key: "f1-kid-kids",      theme: "Crianças",   role: "you",  term: "kids' glasses",  termPt: "óculos infantil",     phrase: "We have kids' glasses too.",              phrasePt: "Temos óculos infantil também." },
  { key: "f1-kid-flex",      theme: "Crianças",   role: "you",  term: "flexible",       termPt: "flexível",            phrase: "This frame is flexible and safe for children.", phrasePt: "Essa armação é flexível e segura para crianças." },
  { key: "f1-kid-resist",    theme: "Crianças",   role: "you",  term: "resistant",      termPt: "resistente",          phrase: "It's very resistant to falls.",           phrasePt: "É bem resistente a quedas." },
  { key: "f1-kid-sport",     theme: "Crianças",   role: "you",  term: "sports glasses", termPt: "óculos esportivo",    phrase: "Do you need sports glasses?",             phrasePt: "Você precisa de óculos esportivo?" },
  { key: "f1-kid-polar",     theme: "Crianças",   role: "you",  term: "polarized",      termPt: "polarizada",          phrase: "Polarized lenses are great for driving.", phrasePt: "Lentes polarizadas são ótimas para dirigir." },

  // ————— Objeção de preço —————
  { key: "f1-obj-expensive", theme: "Objeções",   role: "cust", term: "expensive",      termPt: "caro",                phrase: "That's a bit expensive for me.",          phrasePt: "Está um pouco caro para mim." },
  { key: "f1-obj-budget",    theme: "Objeções",   role: "you",  term: "budget",         termPt: "orçamento (limite)",  phrase: "What's your budget?",                     phrasePt: "Qual é o seu orçamento?" },
  { key: "f1-obj-cheaper",   theme: "Objeções",   role: "you",  term: "cheaper",        termPt: "mais barato",         phrase: "We have a cheaper option here.",          phrasePt: "Temos uma opção mais barata aqui." },
  { key: "f1-obj-think",     theme: "Objeções",   role: "cust", term: "to think about it", termPt: "pensar a respeito", phrase: "I need to think about it.",              phrasePt: "Preciso pensar a respeito." },
  { key: "f1-obj-another",   theme: "Objeções",   role: "you",  term: "another option", termPt: "outra opção",         phrase: "Let me show you another option.",         phrasePt: "Deixa eu te mostrar outra opção." },
  { key: "f1-obj-worth",     theme: "Objeções",   role: "you",  term: "worth it",       termPt: "vale a pena",         phrase: "For daily use, it's worth it.",           phrasePt: "Para o dia a dia, vale a pena." },

  // ————— Recomendação / venda —————
  { key: "f1-sell-recommend", theme: "Recomendação", role: "you", term: "to recommend", termPt: "recomendar",          phrase: "I recommend these lenses for you.",       phrasePt: "Eu recomendo essas lentes para você." },
  { key: "f1-sell-best",     theme: "Recomendação", role: "you",  term: "the best",      termPt: "o melhor",            phrase: "This is our best option.",                phrasePt: "Essa é a nossa melhor opção." },
  { key: "f1-sell-protect",  theme: "Recomendação", role: "you",  term: "to protect",    termPt: "proteger",            phrase: "These lenses protect your eyes.",         phrasePt: "Essas lentes protegem seus olhos." },
  { key: "f1-sell-lookgood", theme: "Recomendação", role: "you",  term: "to look good",  termPt: "ficar bem",           phrase: "You look good in these!",                 phrasePt: "Você fica bem com esses!" },
  { key: "f1-sell-show",     theme: "Recomendação", role: "you",  term: "to show",       termPt: "mostrar",             phrase: "Let me show you some options.",           phrasePt: "Deixa eu te mostrar algumas opções." },
  { key: "f1-sell-prefer",   theme: "Recomendação", role: "you",  term: "to prefer",     termPt: "preferir",            phrase: "Which one do you prefer?",                phrasePt: "Qual você prefere?" },
  { key: "f1-sell-choose",   theme: "Recomendação", role: "you",  term: "to choose",     termPt: "escolher",            phrase: "Take your time to choose.",               phrasePt: "Fique à vontade para escolher." },

  // ————— Confirmar entendimento —————
  { key: "f1-conf-under",    theme: "Confirmar",  role: "you",  term: "to understand",  termPt: "entender",            phrase: "Did you understand everything?",          phrasePt: "Você entendeu tudo?" },
  { key: "f1-conf-repeat",   theme: "Confirmar",  role: "you",  term: "to repeat",      termPt: "repetir",             phrase: "Let me repeat, please.",                  phrasePt: "Deixa eu repetir, por favor." },
  { key: "f1-conf-clear",    theme: "Confirmar",  role: "you",  term: "clear",          termPt: "claro / compreensível", phrase: "Is that clear for you?",                phrasePt: "Ficou claro para você?" },
  { key: "f1-conf-noproblem", theme: "Confirmar", role: "you",  term: "no problem",     termPt: "sem problema",        phrase: "No problem, I can explain again.",        phrasePt: "Sem problema, posso explicar de novo." },

  // ————— Datas e prazo —————
  { key: "f1-date-today",    theme: "Datas",      role: "you",  term: "today",          termPt: "hoje",                phrase: "It can be ready today.",                  phrasePt: "Pode ficar pronto hoje." },
  { key: "f1-date-tomorrow", theme: "Datas",      role: "you",  term: "tomorrow",       termPt: "amanhã",              phrase: "Come back tomorrow, please.",             phrasePt: "Volte amanhã, por favor." },
  { key: "f1-date-days",     theme: "Datas",      role: "you",  term: "days",           termPt: "dias",                phrase: "It takes about three days.",              phrasePt: "Leva uns três dias." },
  { key: "f1-date-week",     theme: "Datas",      role: "you",  term: "next week",      termPt: "semana que vem",      phrase: "It'll be ready next week.",               phrasePt: "Fica pronto semana que vem." },
  { key: "f1-date-howlong",  theme: "Datas",      role: "cust", term: "how long",       termPt: "quanto tempo",        phrase: "How long does it take?",                  phrasePt: "Quanto tempo leva?" },

  // ————— Uso e cuidado —————
  { key: "f1-care-usedto",   theme: "Cuidado",    role: "you",  term: "to get used to", termPt: "se acostumar",        phrase: "You'll get used to them in a few days.",  phrasePt: "Você se acostuma em poucos dias." },
  { key: "f1-care-avoid",    theme: "Cuidado",    role: "you",  term: "to avoid",       termPt: "evitar",              phrase: "Avoid cleaning them with your shirt.",    phrasePt: "Evite limpar com a camiseta." },
  { key: "f1-care-warm",     theme: "Cuidado",    role: "you",  term: "warm water",     termPt: "água morna",          phrase: "Wash them with warm water.",              phrasePt: "Lave com água morna." },
  { key: "f1-care-careful",  theme: "Cuidado",    role: "you",  term: "carefully",      termPt: "com cuidado",         phrase: "Handle the lenses carefully.",            phrasePt: "Manuseie as lentes com cuidado." },

  // ————— Pagamento (extra) —————
  { key: "f1-pay-pix",       theme: "Pagamento",  role: "you",  term: "Pix",            termPt: "Pix",                 phrase: "You can also pay with Pix.",              phrasePt: "Você também pode pagar no Pix." },
  { key: "f1-pay-change",    theme: "Pagamento",  role: "you",  term: "change",         termPt: "troco",               phrase: "Here's your change.",                     phrasePt: "Aqui está seu troco." },

  // ————— Despedida —————
  { key: "f1-bye-thanks",    theme: "Despedida",  role: "you",  term: "thank you",      termPt: "obrigado(a)",         phrase: "Thank you for choosing us!",              phrasePt: "Obrigado por escolher a gente!" },
  { key: "f1-bye-welcome",   theme: "Despedida",  role: "you",  term: "you're welcome", termPt: "de nada",             phrase: "You're welcome! Have a great day.",       phrasePt: "De nada! Tenha um ótimo dia." },
  { key: "f1-bye-again",     theme: "Despedida",  role: "you",  term: "come again",     termPt: "volte sempre",        phrase: "Please come again!",                      phrasePt: "Volte sempre!" },
  { key: "f1-bye-care",      theme: "Despedida",  role: "you",  term: "take care",      termPt: "se cuida",            phrase: "Take care of your new glasses!",          phrasePt: "Cuide bem dos seus óculos novos!" },
  { key: "f1-bye-slow",      theme: "Despedida",  role: "cust", term: "more slowly",    termPt: "mais devagar",        phrase: "Sorry, can you speak more slowly?",       phrasePt: "Desculpa, pode falar mais devagar?" },
];

// ===================== DINÂMICAS =====================
const DYNAMICS = {
  1: {
    scenarios: [
      {
        title: "Turista com pressa",
        customer: "Você é um turista que quer óculos de sol. Tem pouco tempo, pergunta preço, paga no crédito parcelado.",
        mission: "Atender do início ao fim em inglês: receber, mostrar opções, informar preço, pagamento e se despedir.",
        twist: "No meio do atendimento, diga: \"Sorry, can you speak more slowly?\" e finja não entender uma frase.",
      },
      {
        title: "Preço e prazo",
        customer: "Você quer óculos de grau, tem a receita na mão. Pergunta quanto custa, se parcela, e quando fica pronto.",
        mission: "Responder todas as perguntas de preço, parcelamento e prazo com números claros em inglês.",
        twist: "Pergunte: \"Is there a discount for cash?\" e espere uma resposta com porcentagem.",
      },
      {
        title: "Cliente sem receita",
        customer: "Você quer óculos novos mas não tem receita — só os óculos antigos no rosto.",
        mission: "Oferecer a cópia do grau a partir das lentes atuais e conduzir a venda.",
        twist: "Pergunte: \"Do you have this in black?\" sobre a armação mostrada.",
      },
      {
        title: "Óculos para o filho",
        customer: "Você quer óculos para seu filho de 8 anos. Se preocupa se é resistente e leve, e quer um estojo e uma cordinha.",
        mission: "Recomendar uma armação infantil flexível e resistente, oferecer os acessórios e informar o prazo.",
        twist: "Pergunte: \"Is it safe if he drops it?\"",
      },
      {
        title: "Só dando uma olhada",
        customer: "Você entra dizendo que está \"só olhando\". Está sem pressa, mas na verdade passa o dia no computador e sente os olhos cansados.",
        mission: "Acolher sem pressionar, puxar assunto (small talk) e descobrir a necessidade real para então mostrar opções.",
        twist: "Comece com \"I'm just looking, thanks.\" e só depois diga \"Actually, do you have blue light lenses?\"",
      },
    ],
    checklist: [
      "Cumprimentou o cliente em inglês",
      "Entendeu a necessidade sem precisar de português",
      "Informou o preço com o número correto",
      "Ofereceu as formas de pagamento",
      "Informou o prazo de entrega",
      "Despediu-se com \"Thank you for choosing us\"",
    ],
  },
  2: {
    scenarios: [
      {
        title: "A família do Cazaquistão",
        customer: "Você fala pouco inglês (é a 'filha tradutora'). Seus óculos perderam o parafuso e a haste entortou. Quer copiar o grau da lente e comprar um óculos novo.",
        mission: "Verificar o cadastro (soletrar nome), oferecer a cópia do grau, consertar o óculos e vender lente + armação.",
        twist: "Depois de tudo, diga que quer refazer um óculos cuja armação foi comprada em OUTRA loja.",
      },
      {
        title: "Cliente indeciso",
        customer: "Você está em dúvida entre duas armações, acha uma pesada, pergunta se o antirreflexo é necessário e se tem juros no parcelamento.",
        mission: "Argumentar a escolha da armação, explicar o antirreflexo com benefícios e fechar com parcelamento.",
        twist: "Diga: \"That's more than I expected. Can you make it cheaper?\"",
      },
      {
        title: "Pós-compra com dúvidas",
        customer: "Você já comprou e voltou com dúvidas: como limpar, se risca fácil, se pode trocar a armação, o que a garantia cobre.",
        mission: "Responder cada dúvida com clareza e aproveitar para oferecer o filtro de luz azul.",
        twist: "Diga: \"My eyes hurt when I use my phone at night.\"",
      },
      {
        title: "Presente para o marido",
        customer: "Você quer dar óculos de sol de presente para seu marido, mas não sabe o grau dele nem o tamanho certo. Se preocupa se poderá trocar caso não sirva.",
        mission: "Orientar a compra de presente sem receita, explicar a política de troca e sugerir vale-presente como alternativa segura.",
        twist: "Pergunte: \"What if he doesn't like it?\"",
      },
      {
        title: "Segunda via urgente",
        customer: "Você perdeu seus óculos e precisa de um novo com urgência. Tem uma foto da receita antiga no celular.",
        mission: "Acolher a urgência, conferir a receita pela foto, fazer o cadastro e negociar um prazo expresso.",
        twist: "Pergunte: \"I need them by tomorrow, is that possible?\"",
      },
    ],
    checklist: [
      "Verificou o cadastro pedindo para soletrar o nome",
      "Explicou a cópia do grau corretamente",
      "Argumentou a armação com benefício (não só \"é bonita\")",
      "Explicou o antirreflexo com pelo menos 2 benefícios",
      "Respondeu a objeção de preço com opções (desconto à vista / parcelas)",
      "Conduziu a situação da armação de outra loja sem travar",
      "Explicou prazo em dias úteis + aviso no WhatsApp",
      "Encerrou profissionalmente",
    ],
  },
  3: {
    scenarios: [
      {
        title: "Executivo de telas",
        customer: "Você trabalha 10h por dia no computador, tem dor de cabeça diária, dirige à noite e as luzes incomodam. Receita de 3 anos atrás. Acha 1.400 caro e viu mais barato na internet.",
        mission: "Conduzir a anamnese completa, recomendar o exame, apresentar a escada de lentes e fechar a Freeform contornando as objeções.",
        twist: "No fechamento, pergunte: \"And if I don't adapt?\"",
      },
      {
        title: "Medo de multifocal",
        customer: "Você precisa de multifocal mas sua amiga ficou tonta com a dela e você está com medo. Pergunta a diferença entre digital e Freeform.",
        mission: "Acolher o medo, explicar por que a tontura acontece (campos estreitos da convencional) e apresentar digital e Freeform como solução.",
        twist: "Pergunte: \"What's the real difference between digital and Freeform?\"",
      },
      {
        title: "Negociador duro",
        customer: "Você quer a melhor lente mas negocia tudo: acha caro, pede desconto, compara com a internet, pergunta de garantia.",
        mission: "Defender o valor (não só o preço): custo por dia, serviço incluso, garantia de adaptação, condições de pagamento.",
        twist: "Diga: \"I saw cheaper prices online.\" e insista uma segunda vez no desconto.",
      },
      {
        title: "Comparando duas óticas",
        customer: "Você já tem um orçamento mais barato de outra ótica e veio comparar. Quer entender por que aqui é mais caro antes de decidir.",
        mission: "Fazer a anamnese, mostrar o valor agregado (exame, garantia de adaptação, serviço e ajustes) e justificar a diferença sem baixar o preço na hora.",
        twist: "Diga: \"The other store quoted me nine hundred. Why are you more expensive?\"",
      },
      {
        title: "Retorno por inadaptação",
        customer: "Você voltou frustrado porque não se adaptou à multifocal que comprou. Está considerando pedir o dinheiro de volta.",
        mission: "Acolher a frustração, investigar a causa (medição, hábito de uso, tipo de lente) e oferecer solução dentro da garantia de adaptação antes de falar em reembolso.",
        twist: "Diga: \"I want my money back.\"",
      },
    ],
    checklist: [
      "Fez pelo menos 3 perguntas de anamnese",
      "Ouviu as respostas sem interromper",
      "Conectou os sintomas à recomendação do exame",
      "Explicou as lentes com benefícios, não só características",
      "Ligou a recomendação ao perfil do cliente (telas / direção noturna)",
      "Apresentou os preços com segurança, sem gaguejar",
      "Contornou a objeção de preço sem desvalorizar o produto",
      "Respondeu a comparação com a internet mostrando o valor do serviço",
      "Ofereceu condições (à vista com desconto / 12x sem juros)",
      "Tentou o fechamento com pergunta direta",
    ],
  },
};

// ===================== HELPERS =====================
function getCards(level) {
  const cards = [];
  level.sections.forEach((sec, si) => {
    sec.lines.forEach((ln, li) => {
      if (ln.sp === "you") {
        cards.push({ key: `${level.id}-${si}-${li}`, type: "you", en: ln.en, pt: ln.pt, section: sec.title });
      } else {
        // resposta sugerida: a próxima fala sua na mesma seção
        let reply = null;
        for (let k = li + 1; k < sec.lines.length; k++) {
          if (sec.lines[k].sp === "you") { reply = sec.lines[k].en; break; }
        }
        cards.push({ key: `${level.id}-${si}-${li}`, type: "cust", en: ln.en, pt: ln.pt, section: sec.title, reply });
      }
    });
  });
  return cards;
}

const ONES = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
function numToWords(n) {
  if (n < 0 || n > 9999 || isNaN(n)) return String(n);
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  if (n < 1000) return ONES[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + numToWords(n % 100) : "");
  return ONES[Math.floor(n / 1000)] + " thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "");
}
function normWords(s) {
  return s
    .toLowerCase()
    .replace(/%/g, " percent ")
    .replace(/(\d+)/g, (m) => " " + numToWords(parseInt(m, 10)) + " ")
    .replace(/[^a-z\s']/g, " ")
    .replace(/'/g, "")
    .split(/\s+/)
    .filter(Boolean);
}
function scorePronunciation(target, transcript, confidence) {
  const displayWords = target.split(" ");
  const tTokens = [];
  const tMap = [];
  displayWords.forEach((w, di) => {
    normWords(w).forEach((tok) => { tTokens.push(tok); tMap.push(di); });
  });
  const hTokens = normWords(transcript);
  const n = tTokens.length, m = hTokens.length;

  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = tTokens[i - 1] === hTokens[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  const hit = new Array(n).fill(false);
  let i = n, j = m;
  while (i > 0 && j > 0) {
    if (tTokens[i - 1] === hTokens[j - 1] && dp[i][j] === dp[i - 1][j - 1]) { hit[i - 1] = true; i--; j--; }
    else if (dp[i][j] === dp[i - 1][j - 1] + 1) { i--; j--; }
    else if (dp[i][j] === dp[i - 1][j] + 1) { i--; }
    else { j--; }
  }

  const errors = dp[n][m];
  let wordPct = n ? Math.max(0, Math.round((1 - errors / n) * 100)) : 0;

  // A acurácia das palavras é o que importa para o aprendiz e é o score principal.
  // A "confiança" do reconhecedor é instável (muitos navegadores devolvem 0 ou
  // valores arbitrários), então ela só dá um leve ajuste — no máximo -15%.
  let confPct = null;
  let pct = wordPct;
  if (typeof confidence === "number" && confidence > 0 && confidence <= 1) {
    confPct = Math.round(confidence * 100);
    pct = Math.round(wordPct * (0.85 + 0.15 * confidence));
  }

  const displayHits = displayWords.map((w, di) => {
    const idxs = [];
    tMap.forEach((d, k) => { if (d === di) idxs.push(k); });
    return idxs.length === 0 ? true : idxs.every((k) => hit[k]);
  });

  return { pct, wordPct, confPct, displayHits };
}

// ===================== APP =====================
export default function VooxEnglishTrainer() {
  const [view, setView] = useState("home"); // home | level | quiz
  const [tab, setTab] = useState("read");   // read | srs | pron | dyn
  const [levelId, setLevelId] = useState(1);
  const [data, setData] = useState({ unlocked: 1, best: {}, srs: {}, pron: {}, dyn: {}, daily: DEFAULT_DAILY });
  const [loaded, setLoaded] = useState(false);
  const [showFixes, setShowFixes] = useState(false);

  // quiz
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [picked, setPicked] = useState(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r && r.value) {
          const p = JSON.parse(r.value);
          if (p && p.unlocked) setData({ srs: {}, pron: {}, best: {}, dyn: {}, ...p, daily: { ...DEFAULT_DAILY, ...(p.daily || {}) } });
        }
      } catch (e) { /* primeira vez */ }
      setLoaded(true);
    })();
  }, []);

  const save = useCallback(async (next) => {
    setData(next);
    try { await window.storage.set(STORAGE_KEY, JSON.stringify(next)); }
    catch (e) { console.error("Falha ao salvar", e); }
  }, []);

  const level = LEVELS.find((l) => l.id === levelId);
  const cards = level ? getCards(level) : [];
  const easyCount = cards.filter((c) => (data.srs[c.key]?.r ?? -1) >= 2).length;
  // Fase 1: a prova só libera com TODOS os termos falados bem (mapa da fala 100% verde).
  // Demais níveis: mantém o critério de todos os cards em Fácil/Muito fácil.
  const spokenWell = FASE1_TERMS.filter((t) => (data.pron[t.key] || 0) >= 80).length;
  const quizUnlocked = level && level.id === 1
    ? FASE1_TERMS.length > 0 && spokenWell === FASE1_TERMS.length
    : cards.length > 0 && easyCount === cards.length;

  const openLevel = (id) => { setLevelId(id); setTab("read"); setView("level"); };

  const rateCard = (key, r) => {
    const srs = { ...data.srs, [key]: { r, due: Date.now() + RATINGS[r].interval } };
    save({ ...data, srs });
  };

  // Estuda um termo da Fase 1: grava a nota SRS e, se for a 1ª vez (termo novo),
  // marca a data de introdução e atualiza o streak quando a meta do dia é batida.
  const studyCard = (key, r, wasNew) => {
    const srs = { ...data.srs, [key]: { r, due: Date.now() + RATINGS[r].interval } };
    const daily = { ...DEFAULT_DAILY, ...(data.daily || {}) };
    daily.introduced = { ...(daily.introduced || {}) };
    if (wasNew && !daily.introduced[key]) {
      const today = ymd(new Date());
      daily.introduced[key] = today;
      const introducedToday = Object.values(daily.introduced).filter((d) => d === today).length;
      const newRemaining = FASE1_TERMS.filter((t) => !daily.introduced[t.key]).length;
      if ((introducedToday >= daily.pace || newRemaining === 0) && daily.lastGoalDay !== today) {
        const yesterday = ymd(addDays(new Date(), -1));
        daily.streak = daily.lastGoalDay === yesterday ? (daily.streak || 0) + 1 : 1;
        daily.lastGoalDay = today;
        daily.bestStreak = Math.max(daily.bestStreak || 0, daily.streak);
      }
    }
    save({ ...data, srs, daily });
  };

  const setPace = (v) => save({ ...data, daily: { ...DEFAULT_DAILY, ...(data.daily || {}), pace: v } });

  const savePron = (key, pct) => {
    const prev = data.pron[key] || 0;
    if (pct > prev) save({ ...data, pron: { ...data.pron, [key]: pct } });
  };

  const saveDyn = (lvlId, pct) => {
    const prev = data.dyn[lvlId] || 0;
    if (pct > prev) save({ ...data, dyn: { ...data.dyn, [lvlId]: pct } });
  };

  const startQuiz = () => {
    setQIndex(0); setAnswers([]); setPicked(null); setFinished(false); setView("quiz");
  };

  const confirmAnswer = () => {
    if (picked === null) return;
    const newAnswers = [...answers, picked];
    setAnswers(newAnswers);
    setPicked(null);
    if (qIndex + 1 < level.quiz.length) { setQIndex(qIndex + 1); return; }
    const score = newAnswers.filter((a, i) => a === level.quiz[i].a).length;
    const best = { ...data.best, [level.id]: Math.max(score, data.best[level.id] || 0) };
    let unlocked = data.unlocked;
    if (score >= passFor(level) && level.id >= unlocked && level.id < 3) unlocked = level.id + 1;
    save({ ...data, unlocked, best });
    setFinished(true);
  };

  const resetAll = async () => {
    await save({ unlocked: 1, best: {}, srs: {}, pron: {}, dyn: {}, daily: DEFAULT_DAILY });
    setView("home");
  };

  if (!loaded) {
    return (
      <Shell>
        <div style={{ textAlign: "center", padding: "80px 0", color: C.inkSoft }}>Carregando seu progresso…</div>
      </Shell>
    );
  }

  return (
    <Shell>
      {view === "home" && (
        <Home data={data} onOpen={openLevel} showFixes={showFixes} setShowFixes={setShowFixes} onReset={resetAll} />
      )}
      {view === "level" && level && (
        <LevelView
          level={level} tab={tab} setTab={setTab} data={data}
          cards={cards} easyCount={easyCount} quizUnlocked={quizUnlocked}
          onBack={() => setView("home")} onQuiz={startQuiz}
          rateCard={rateCard} savePron={savePron} saveDyn={saveDyn}
          studyCard={studyCard} setPace={setPace}
        />
      )}
      {view === "quiz" && level && (
        <Quiz
          level={level} qIndex={qIndex} picked={picked} setPicked={setPicked}
          answers={answers} finished={finished} onConfirm={confirmAnswer}
          onBack={() => setView("level")} onHome={() => setView("home")} onRetry={startQuiz}
        />
      )}
    </Shell>
  );
}

// ===================== SHELL =====================
function Shell({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: FONT_BODY, color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        button { font-family: inherit; cursor: pointer; }
        @keyframes flipIn { from { transform: rotateX(70deg); opacity: 0; } to { transform: rotateX(0); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px 60px" }}>{children}</div>
    </div>
  );
}

// ===================== HOME =====================
function Home({ data, onOpen, showFixes, setShowFixes, onReset }) {
  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.goldDeep, fontWeight: 700 }}>
          Ótica VooX · Feira dos Importados
        </div>
        <h1 style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 34, margin: "6px 0 4px", color: C.card }}>
          English for Optics
        </h1>
        <p style={{ margin: 0, color: C.inkSoft, fontSize: 14, lineHeight: 1.5 }}>
          Leia o diálogo completo, domine os cards, treine a pronúncia, faça a dinâmica em dupla e passe na prova.
        </p>
      </header>

      {LEVELS.map((lv) => {
        const locked = lv.id > data.unlocked;
        const cs = getCards(lv);
        const easy = cs.filter((c) => (data.srs[c.key]?.r ?? -1) >= 2).length;
        const best = data.best[lv.id];
        const passed = (best || 0) >= passFor(lv);
        const dyn = data.dyn[lv.id];
        return (
          <button
            key={lv.id}
            onClick={() => !locked && onOpen(lv.id)}
            disabled={locked}
            style={{
              display: "block", width: "100%", textAlign: "left", border: "none",
              background: locked ? "#DCE1D6" : C.card,
              color: locked ? C.inkSoft : C.cream,
              borderRadius: 16, padding: "18px 18px 16px", marginBottom: 14,
              opacity: locked ? 0.75 : 1,
              boxShadow: locked ? "none" : "0 4px 14px rgba(32,52,42,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{
                fontFamily: FONT_HEAD, fontSize: 15, fontWeight: 700,
                color: locked ? C.inkSoft : C.gold,
                border: `1px solid ${locked ? C.inkSoft : C.gold}`,
                borderRadius: 8, padding: "2px 8px",
              }}>
                SPH {lv.grade}
              </span>
              <span style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 700 }}>
                Nível {lv.id} · {lv.name}
              </span>
            </div>
            <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 6, color: locked ? C.inkSoft : C.gold, fontWeight: 600 }}>
              {lv.tag}
            </div>
            <p style={{ margin: "8px 0 10px", fontSize: 14, lineHeight: 1.5, color: locked ? C.inkSoft : "#DDE4DA" }}>
              {lv.desc}
            </p>
            <div style={{ fontSize: 13, fontWeight: 600, color: locked ? C.inkSoft : passed ? C.okSoft : C.gold }}>
              {locked
                ? "🔒 Passe na prova anterior para desbloquear"
                : passed
                  ? `✓ Aprovado — melhor nota: ${best}/${lv.quiz.length}${dyn ? ` · Dinâmica: ${dyn}%` : ""}`
                  : `Cards: ${easy}/${cs.length}${best !== undefined ? ` · Prova: ${best}/${lv.quiz.length}` : ""}${dyn ? ` · Dinâmica: ${dyn}%` : ""}`}
            </div>
          </button>
        );
      })}

      <button
        onClick={() => setShowFixes(!showFixes)}
        style={{ width: "100%", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px", textAlign: "left", marginTop: 6 }}
      >
        <span style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 17, color: C.card }}>⚠ Erros do atendimento real</span>
        <span style={{ float: "right", color: C.goldDeep, fontWeight: 700 }}>{showFixes ? "−" : "+"}</span>
        {showFixes && (
          <div style={{ marginTop: 12 }}>
            {COMMON_FIXES.map((f, i) => (
              <div key={i} style={{ padding: "10px 0", borderTop: i > 0 ? `1px solid ${C.line}` : "none" }}>
                <div style={{ fontSize: 13, color: C.bad, textDecoration: "line-through" }}>{f.wrong}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.ok, margin: "2px 0" }}>{f.right}</div>
                <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.4 }}>{f.note}</div>
              </div>
            ))}
          </div>
        )}
      </button>

      <button onClick={onReset} style={{ marginTop: 18, background: "none", border: "none", color: C.inkSoft, fontSize: 12.5, textDecoration: "underline", display: "block" }}>
        Zerar meu progresso
      </button>
    </div>
  );
}

// ===================== LEVEL VIEW (abas) =====================
function LevelView({ level, tab, setTab, data, cards, easyCount, quizUnlocked, onBack, onQuiz, rateCard, savePron, saveDyn, studyCard, setPace }) {
  const pass = passFor(level);
  const isFase1 = level.id === 1;
  const daily = data.daily || DEFAULT_DAILY;
  const today = ymd(new Date());
  const introducedToday = Object.values(daily.introduced || {}).filter((d) => d === today).length;
  const fase1SpokenWell = FASE1_TERMS.filter((t) => (data.pron[t.key] || 0) >= 80).length;
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.goldDeep, fontWeight: 700, fontSize: 14, padding: 0, marginBottom: 12 }}>
        ← Níveis
      </button>

      <h2 style={{ fontFamily: FONT_HEAD, fontSize: 27, fontWeight: 700, margin: "0 0 2px", color: C.card }}>
        Nível {level.id} · {level.name}
      </h2>
      <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: C.goldDeep, fontWeight: 700, marginBottom: 14 }}>
        {level.tag}
      </div>

      <div style={{ display: "flex", gap: 5, marginBottom: 18 }}>
        <TabBtn active={tab === "read"} onClick={() => setTab("read")} label="📖 Script" />
        {isFase1 ? (
          <TabBtn active={tab === "meta"} onClick={() => setTab("meta")} label="🎯 Meta do dia" badge={`${introducedToday}/${daily.pace}`} />
        ) : (
          <>
            <TabBtn active={tab === "srs"} onClick={() => setTab("srs")} label="🃏 Cards" badge={`${easyCount}/${cards.length}`} done={quizUnlocked} />
            <TabBtn active={tab === "pron"} onClick={() => setTab("pron")} label="🎤 Fala" />
          </>
        )}
        <TabBtn active={tab === "dyn"} onClick={() => setTab("dyn")} label="🎭 Dinâmica" />
      </div>

      {tab === "read" && <ReadTab level={level} />}
      {tab === "meta" && isFase1 && (
        <MetaDoDiaTab terms={FASE1_TERMS} srs={data.srs} pron={data.pron} daily={daily}
          studyCard={studyCard} savePron={savePron} setPace={setPace} />
      )}
      {tab === "srs" && !isFase1 && <SrsTab cards={cards} srs={data.srs} rateCard={rateCard} quizUnlocked={quizUnlocked} />}
      {tab === "pron" && !isFase1 && <PronTab cards={cards.filter((c) => c.type === "you")} pron={data.pron} savePron={savePron} />}
      {tab === "dyn" && <DynTab level={level} best={data.dyn[level.id]} saveDyn={saveDyn} />}

      <div style={{ marginTop: 22 }}>
        <button
          onClick={onQuiz}
          disabled={!quizUnlocked}
          style={{
            width: "100%", border: "none", borderRadius: 12, padding: "15px 0",
            fontSize: 16.5, fontWeight: 700, fontFamily: FONT_HEAD,
            background: quizUnlocked ? C.gold : "#D8DCD2",
            color: quizUnlocked ? C.card : C.inkSoft,
            boxShadow: quizUnlocked ? "0 4px 12px rgba(200,169,110,0.4)" : "none",
          }}
        >
          {quizUnlocked
            ? `Fazer a prova do Nível ${level.id}`
            : isFase1
              ? `🔒 Prova travada — ${fase1SpokenWell}/${FASE1_TERMS.length} termos falados bem`
              : `🔒 Prova travada — ${easyCount}/${cards.length} cards fáceis`}
        </button>
        <p style={{ textAlign: "center", fontSize: 12.5, color: C.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
          {isFase1
            ? "A prova libera quando TODOS os termos ficarem verdes no mapa da fala (falados com ≥80%)."
            : "A prova libera com 100% dos cards em Fácil ou Muito fácil."}
          {" "}Precisa de {pass}/{level.quiz.length} para {level.id < 3 ? "desbloquear o próximo nível" : "concluir o treinamento"}.
          {data.best[level.id] !== undefined ? ` Sua melhor nota: ${data.best[level.id]}/${level.quiz.length}.` : ""}
        </p>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, label, badge, done }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: "9px 2px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
        border: `1.5px solid ${active ? C.card : C.line}`,
        background: active ? C.card : C.paper,
        color: active ? C.cream : C.inkSoft,
      }}
    >
      {label}
      {badge && (
        <span style={{
          display: "block", fontSize: 10.5, fontWeight: 700, marginTop: 2,
          color: done ? (active ? C.okSoft : C.ok) : (active ? C.gold : C.goldDeep),
        }}>
          {done ? "✓ " : ""}{badge}
        </span>
      )}
    </button>
  );
}

// ===================== ABA SCRIPT =====================
function ReadTab({ level }) {
  return (
    <div>
      {level.sections.map((sec, si) => (
        <div key={si} style={{ background: C.paper, borderRadius: 14, border: `1px solid ${C.line}`, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 17, color: C.card, marginBottom: 10 }}>{sec.title}</div>
          {sec.lines.map((ln, li) => {
            const isYou = ln.sp === "you";
            return (
              <div key={li} style={{ padding: "8px 0", borderTop: li > 0 ? `1px dashed ${C.line}` : "none" }}>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2,
                  color: isYou ? C.goldDeep : C.inkSoft,
                  border: `1px solid ${isYou ? C.gold : C.line}`,
                  borderRadius: 6, padding: "1px 6px",
                  background: isYou ? "#FBF6EC" : "transparent",
                }}>
                  {isYou ? "VOCÊ" : "CLIENTE"}
                </span>
                <div style={{ fontSize: 15.5, fontWeight: 600, color: C.ink, marginTop: 6, lineHeight: 1.45 }}>{ln.en}</div>
                <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2, lineHeight: 1.4 }}>{ln.pt}</div>
              </div>
            );
          })}
        </div>
      ))}

      <div style={{ background: C.card, borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 17, color: C.gold, marginBottom: 8 }}>Vocabulário-chave</div>
        {level.vocab.map(([pt, en], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "5px 0", fontSize: 13.5 }}>
            <span style={{ color: "#C9D3C6" }}>{pt}</span>
            <span style={{ color: C.cream, fontWeight: 600, textAlign: "right" }}>{en}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== ABA CARDS (SRS) =====================
function SrsTab({ cards, srs, rateCard, quizUnlocked }) {
  const [queue, setQueue] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const due = cards.filter((c) => {
      const s = srs[c.key];
      if (!s) return true;
      if (s.r < 2) return true;
      return s.due <= now;
    });
    setQueue(due.map((c) => c.key));
    setFlipped(false);
    setSessionDone(due.length === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const easyCount = cards.filter((c) => (srs[c.key]?.r ?? -1) >= 2).length;
  const current = cards.find((c) => c.key === queue[0]);

  const handleRate = (r) => {
    if (!current) return;
    rateCard(current.key, r);
    setFlipped(false);
    setQueue((q) => {
      const rest = q.slice(1);
      if (r === 0) { const nq = [...rest]; nq.splice(Math.min(3, nq.length), 0, current.key); return nq; }
      if (r === 1) return [...rest, current.key];
      if (rest.length === 0) setSessionDone(true);
      return rest;
    });
  };

  const isCust = current && current.type === "cust";

  return (
    <div>
      <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: C.inkSoft, marginBottom: 6 }}>
          <span>Cards Fácil ou Muito fácil</span>
          <span style={{ color: quizUnlocked ? C.ok : C.goldDeep }}>{easyCount}/{cards.length}</span>
        </div>
        <div style={{ height: 7, background: "#DCE1D6", borderRadius: 4 }}>
          <div style={{ height: "100%", width: `${(easyCount / cards.length) * 100}%`, background: quizUnlocked ? C.ok : C.gold, borderRadius: 4, transition: "width .3s ease" }} />
        </div>
      </div>

      {sessionDone || !current ? (
        <div style={{ background: C.card, borderRadius: 16, padding: "34px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>{quizUnlocked ? "🏆" : "☕"}</div>
          <div style={{ fontFamily: FONT_HEAD, fontSize: 21, fontWeight: 700, color: C.gold, margin: "8px 0 6px" }}>
            {quizUnlocked ? "Todos os cards dominados!" : "Sessão concluída"}
          </div>
          <p style={{ fontSize: 14, color: "#DDE4DA", margin: 0, lineHeight: 1.5 }}>
            {quizUnlocked
              ? "A prova está liberada. Os cards fáceis voltarão automaticamente quando o intervalo vencer."
              : "Nenhum card pendente agora. Os classificados como Fácil ou Muito fácil voltam quando o intervalo vencer."}
          </p>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
            {queue.length} {queue.length === 1 ? "card na fila" : "cards na fila"} · {current.section}
          </div>

          <div
            onClick={() => !flipped && setFlipped(true)}
            style={{
              background: flipped ? C.card : C.paper,
              border: `1.5px solid ${flipped ? C.card : isCust ? C.goldDeep : C.line}`,
              borderRadius: 16, padding: "26px 20px", minHeight: 180,
              display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
              textAlign: "center", cursor: flipped ? "default" : "pointer",
              boxShadow: "0 4px 14px rgba(32,52,42,0.12)",
              animation: "flipIn .25s ease",
            }}
          >
            {!flipped ? (
              isCust ? (
                <>
                  <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.goldDeep, fontWeight: 700, marginBottom: 10 }}>
                    👂 O cliente disse:
                  </div>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 20, fontWeight: 600, color: C.ink, lineHeight: 1.4 }}>
                    "{current.en}"
                  </div>
                  <div style={{ fontSize: 12.5, color: C.goldDeep, fontWeight: 600, marginTop: 16 }}>
                    O que ele quer? Como responder? Toque para conferir
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.goldDeep, fontWeight: 700, marginBottom: 10 }}>
                    🗣 Como você diria em inglês?
                  </div>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 20, fontWeight: 600, color: C.ink, lineHeight: 1.4 }}>
                    {current.pt}
                  </div>
                  <div style={{ fontSize: 12.5, color: C.goldDeep, fontWeight: 600, marginTop: 16 }}>
                    Fale em voz alta e toque para virar
                  </div>
                </>
              )
            ) : (
              isCust ? (
                <>
                  <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: 8 }}>
                    Significado
                  </div>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 18, fontWeight: 600, color: C.cream, lineHeight: 1.4 }}>
                    {current.pt}
                  </div>
                  {current.reply && (
                    <>
                      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.gold, fontWeight: 700, margin: "14px 0 6px" }}>
                        Resposta sugerida
                      </div>
                      <div style={{ fontSize: 14.5, color: "#DDE4DA", lineHeight: 1.45 }}>"{current.reply}"</div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: 10 }}>
                    Resposta
                  </div>
                  <div style={{ fontFamily: FONT_HEAD, fontSize: 20, fontWeight: 600, color: C.cream, lineHeight: 1.4 }}>
                    {current.en}
                  </div>
                  <div style={{ fontSize: 13.5, color: "#B9C4B6", marginTop: 8 }}>{current.pt}</div>
                </>
              )
            )}
          </div>

          {flipped && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 7, marginTop: 14 }}>
              {RATINGS.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleRate(i)}
                  style={{
                    border: `1.5px solid ${r.color}`, background: C.paper, color: r.color,
                    borderRadius: 10, padding: "10px 2px", fontWeight: 700, fontSize: 12.5, lineHeight: 1.2,
                  }}
                >
                  {r.label}
                  <span style={{ display: "block", fontSize: 10.5, fontWeight: 600, opacity: 0.75, marginTop: 2 }}>{r.sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===================== MOTOR DE FALA (reaproveitável) =====================
// Encapsula TTS (ouvir), reconhecimento de voz (nota) e gravação da própria fala.
// Usado pelo PronTab e pelo card híbrido da Fase 1. `targetEn` é a frase-alvo a
// pontuar; `onScore(pct, result)` é chamado quando há uma nota nova.
function useSpeech(targetEn, onScore) {
  const [listening, setListening] = useState(false);
  const [starting, setStarting] = useState(false); // mic pedido, mas ainda não engatou
  const [liveText, setLiveText] = useState("");     // transcrição ao vivo
  const [result, setResult] = useState(null);
  const [srError, setSrError] = useState(null);
  const [selfMode, setSelfMode] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);   // gravação da própria fala

  const recRef = useRef(null);        // SpeechRecognition
  const mediaRef = useRef(null);      // MediaRecorder
  const streamRef = useRef(null);     // stream do getUserMedia
  const chunksRef = useRef([]);
  const finalRef = useRef("");        // transcrição final acumulada
  const interimRef = useRef("");      // último trecho provisório (rede de segurança)
  const confRef = useRef([]);         // confianças por resultado
  const stopTimerRef = useRef(null);
  const startFallbackRef = useRef(null);
  const audioUrlRef = useRef(null);
  const myAudioRef = useRef(null);    // <audio> da própria gravação
  const onScoreRef = useRef(onScore);
  useEffect(() => { onScoreRef.current = onScore; });

  const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

  useEffect(() => { audioUrlRef.current = audioUrl; }, [audioUrl]);

  useEffect(() => () => {
    try { recRef.current && recRef.current.abort(); } catch (e) {}
    try { if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop(); } catch (e) {}
    try { streamRef.current && streamRef.current.getTracks().forEach((t) => t.stop()); } catch (e) {}
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (startFallbackRef.current) clearTimeout(startFallbackRef.current);
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  // Trocar de alvo zera tudo e descarta a gravação anterior.
  useEffect(() => {
    setResult(null); setSrError(null); setLiveText(""); setSelfMode(false);
    setAudioUrl((u) => { if (u) URL.revokeObjectURL(u); return null; });
  }, [targetEn]);

  const speak = (rate) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(targetEn);
      u.lang = "en-US";
      u.rate = rate;
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find((v) => v.lang === "en-US") || voices.find((v) => v.lang && v.lang.startsWith("en"));
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) {
      setSrError("Não consegui reproduzir o áudio neste navegador.");
    }
  };

  const playMine = () => {
    try {
      window.speechSynthesis.cancel();
      if (myAudioRef.current) { myAudioRef.current.currentTime = 0; myAudioRef.current.play(); }
    } catch (e) {}
  };

  // Encerra a captura: para gravação/stream, gera o áudio e pontua o que foi dito.
  const finishListening = (errored) => {
    if (stopTimerRef.current) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
    if (startFallbackRef.current) { clearTimeout(startFallbackRef.current); startFallbackRef.current = null; }
    setListening(false);
    setStarting(false);
    try { if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop(); } catch (e) {}
    try { if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); } catch (e) {}
    streamRef.current = null;

    const transcript = (finalRef.current + " " + interimRef.current).trim();
    if (!errored && transcript) {
      const avgConf = confRef.current.length
        ? confRef.current.reduce((a, b) => a + b, 0) / confRef.current.length
        : 0;
      const s = scorePronunciation(targetEn, transcript, avgConf);
      const full = { ...s, transcript };
      setResult(full);
      if (onScoreRef.current) onScoreRef.current(full.pct, full);
    }
  };

  const stopListening = () => {
    if (stopTimerRef.current) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
    if (recRef.current) {
      try { recRef.current.stop(); } catch (e) { finishListening(false); }
    } else {
      finishListening(false); // caminho sem reconhecimento (só gravação)
    }
  };

  const listen = async () => {
    setResult(null); setSrError(null); setLiveText("");
    finalRef.current = ""; interimRef.current = ""; confRef.current = [];
    setAudioUrl((u) => { if (u) URL.revokeObjectURL(u); return null; });

    // 1. Abre o mic e mantém o stream — a nossa gravação captura o áudio COMPLETO,
    //    mesmo que o reconhecedor corte o começo/fim.
    let stream = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }
    } catch (e) {
      setSrError("O microfone está bloqueado neste ambiente (limitação do app, não do seu celular). Use o modo autoavaliação abaixo — ou rode o app publicado no navegador para liberar o mic.");
      setSelfMode(true);
      return;
    }

    // 2. Grava para você poder OUVIR sua própria fala e comparar com o nativo.
    try {
      if (stream && typeof MediaRecorder !== "undefined") {
        chunksRef.current = [];
        const mr = new MediaRecorder(stream);
        mediaRef.current = mr;
        mr.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
        mr.onstop = () => {
          try {
            if (chunksRef.current.length) {
              const blob = new Blob(chunksRef.current, { type: chunksRef.current[0].type || "audio/webm" });
              setAudioUrl(URL.createObjectURL(blob));
            }
          } catch (e) {}
        };
        mr.start();
      }
    } catch (e) { /* gravação é opcional */ }

    // 3. Sem reconhecimento: ainda dá pra gravar, ouvir e autoavaliar.
    if (!SR) {
      setSelfMode(true);
      setStarting(false);
      setListening(true);
      setSrError("Reconhecimento de voz não disponível aqui — mas você pode gravar, ouvir e comparar com o nativo.");
      return;
    }

    // 4. Reconhecimento em modo CONTÍNUO: não encerra no primeiro silêncio,
    //    então não corta o fim da frase. Você encerra tocando em Parar.
    try {
      const rec = new SR();
      recRef.current = rec;
      rec.lang = "en-US";
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      setStarting(true);
      setListening(true);

      // Só mostra "fale agora" quando o mic realmente engatou — evita cortar o início.
      // Alguns navegadores não disparam onaudiostart de forma confiável, então há um
      // fallback que libera o estado depois de 1,2s para o botão Parar nunca travar.
      rec.onaudiostart = () => setStarting(false);
      rec.onspeechstart = () => setStarting(false);
      startFallbackRef.current = setTimeout(() => setStarting(false), 1200);

      rec.onresult = (ev) => {
        let interim = "";
        for (let k = ev.resultIndex; k < ev.results.length; k++) {
          const r = ev.results[k];
          if (r.isFinal) {
            finalRef.current += r[0].transcript + " ";
            if (typeof r[0].confidence === "number" && r[0].confidence > 0) confRef.current.push(r[0].confidence);
          } else {
            interim += r[0].transcript;
          }
        }
        interimRef.current = interim;
        setLiveText((finalRef.current + interim).trim());
      };
      rec.onerror = (ev) => {
        if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
          setSrError("Permissão do microfone negada pelo ambiente. Use o modo autoavaliação abaixo.");
          setSelfMode(true);
          finishListening(true);
        } else if (ev.error === "no-speech") {
          setSrError("Ainda não ouvi nada — chegue mais perto e fale.");
        } else if (ev.error === "audio-capture") {
          setSrError("O microfone está ocupado (a gravação e o reconhecedor brigaram por ele). Toque em Falar de novo.");
        } else if (ev.error === "network") {
          // Brave (e alguns navegadores) removem o serviço de fala do Google -> erro
          // "network" imediato. Não adianta repetir: cai no modo gravar + autoavaliar,
          // que funciona aqui. A nota por voz só roda no Chrome ou Edge.
          setSrError("Este navegador não faz nota por voz (o Brave bloqueia o serviço de fala do Google). Para a nota automática, use Chrome ou Edge. Aqui você pode gravar, ouvir e se autoavaliar 👇");
          setSelfMode(true);
          finishListening(true);
        } else if (ev.error !== "aborted") {
          setSrError("Erro no reconhecimento de voz (" + ev.error + "). Tente de novo.");
        }
      };
      rec.onend = () => finishListening(false);
      rec.start();

      // Rede de segurança: para sozinho em 20s se algo travar.
      stopTimerRef.current = setTimeout(() => { try { rec.stop(); } catch (e) {} }, 20000);
    } catch (e) {
      setListening(false);
      setStarting(false);
      setSrError("Não consegui iniciar o microfone neste navegador.");
      try { if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop(); } catch (e2) {}
      try { if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); } catch (e2) {}
      streamRef.current = null;
    }
  };

  return { SR, listening, starting, liveText, result, srError, selfMode, audioUrl, myAudioRef, speak, playMine, listen, stopListening };
}

// ===================== ABA PRONÚNCIA =====================
function PronTab({ cards, pron, savePron }) {
  const [idx, setIdx] = useState(0);
  const card = cards[idx];
  const best = pron[card.key] || 0;
  const {
    listening, starting, liveText, result, srError, selfMode, audioUrl,
    myAudioRef, speak, playMine, listen, stopListening,
  } = useSpeech(card.en, (pct) => savePron(card.key, pct));

  const feedback = (pct) =>
    pct >= 80 ? { txt: "Excelente! Pronúncia clara.", color: C.ok }
    : pct >= 60 ? { txt: "Boa! Quase lá — repita as palavras em vermelho.", color: "#B4842D" }
    : { txt: "Vamos de novo. Ouça primeiro e repita devagar.", color: C.bad };

  const displayWords = card.en.split(" ");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0 || listening}
          style={{ background: "none", border: "none", color: (idx === 0 || listening) ? C.line : C.goldDeep, fontWeight: 700, fontSize: 14 }}>
          ← Anterior
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.inkSoft }}>{idx + 1}/{cards.length}</span>
        <button onClick={() => setIdx(Math.min(cards.length - 1, idx + 1))} disabled={idx === cards.length - 1 || listening}
          style={{ background: "none", border: "none", color: (idx === cards.length - 1 || listening) ? C.line : C.goldDeep, fontWeight: 700, fontSize: 14 }}>
          Próxima →
        </button>
      </div>

      <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 16, padding: "22px 18px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.goldDeep, fontWeight: 700, marginBottom: 8 }}>
          {card.section}
        </div>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 20, fontWeight: 600, lineHeight: 1.45, marginBottom: 6 }}>
          {result
            ? displayWords.map((w, i) => (
                <span key={i} style={{ color: result.displayHits[i] ? C.ok : C.bad }}>{w} </span>
              ))
            : <span style={{ color: C.ink }}>{card.en}</span>}
        </div>
        <div style={{ fontSize: 13.5, color: C.inkSoft, marginBottom: 16 }}>{card.pt}</div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <PronBtn onClick={() => speak(0.95)} label="🔊 Ouvir" />
          <PronBtn onClick={() => speak(0.6)} label="🐢 Devagar" />
          {listening ? (
            <button
              onClick={stopListening}
              style={{
                border: "none", borderRadius: 10, padding: "11px 18px", fontWeight: 700, fontSize: 14.5,
                background: starting ? C.goldDeep : C.bad, color: C.cream,
              }}
            >
              {starting ? "⏳ Preparando… (toque p/ parar)" : "⏹ Parar"}
            </button>
          ) : (
            <button
              onClick={listen}
              style={{
                border: "none", borderRadius: 10, padding: "11px 18px", fontWeight: 700, fontSize: 14.5,
                background: C.card, color: C.cream,
              }}
            >
              🎤 Falar
            </button>
          )}
        </div>

        {listening && (
          <div style={{ marginTop: 12, background: C.bg, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: starting ? C.goldDeep : C.bad, marginBottom: liveText ? 4 : 0 }}>
              {starting ? "⏳ Preparando o microfone…" : "🔴 Ouvindo… fale agora e toque em Parar ao terminar"}
            </div>
            {liveText && (
              <div style={{ fontSize: 13.5, color: C.ink, fontStyle: "italic", lineHeight: 1.5 }}>“{liveText}”</div>
            )}
          </div>
        )}

        {audioUrl && !listening && (
          <div style={{ marginTop: 12 }}>
            <PronBtn onClick={playMine} label="▶️ Ouvir minha fala" />
            <audio ref={myAudioRef} src={audioUrl} preload="auto" style={{ display: "none" }} />
          </div>
        )}

        {best > 0 && !result && (
          <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 12 }}>Sua melhor nota nesta frase: <b style={{ color: best >= 80 ? C.ok : C.goldDeep }}>{best}%</b></div>
        )}

        {result && (
          <div style={{ marginTop: 18, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 30, fontWeight: 700, color: feedback(result.pct).color }}>
              {result.pct}%
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: feedback(result.pct).color, marginBottom: 8 }}>
              {feedback(result.pct).txt}
            </div>
            {result.confPct !== null && (
              <div style={{ fontSize: 12.5, color: C.inkSoft, marginBottom: 6 }}>
                Palavras corretas: <b>{result.wordPct}%</b> · Clareza da fala: <b>{result.confPct}%</b>
              </div>
            )}
            <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
              O que eu ouvi: <i>"{result.transcript}"</i>
            </div>
          </div>
        )}

        {srError && (
          <div style={{ marginTop: 14, fontSize: 13, color: C.bad, lineHeight: 1.5, background: "#FBF1EA", borderRadius: 10, padding: "10px 12px" }}>
            {srError}
          </div>
        )}

        {selfMode && (
          <div style={{ marginTop: 14, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.card, marginBottom: 4 }}>
              🪞 Modo autoavaliação
            </div>
            <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5, marginBottom: 10 }}>
              Toque em Ouvir, repita em voz alta imitando o ritmo, e seja honesto consigo:
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button
                onClick={() => savePron(card.key, 80)}
                style={{ flex: 1, border: `1.5px solid ${C.ok}`, background: C.paper, color: C.ok, borderRadius: 10, padding: "11px 8px", fontWeight: 700, fontSize: 13.5 }}
              >
                ✓ Falei com confiança
              </button>
              <button
                onClick={() => savePron(card.key, 40)}
                style={{ flex: 1, border: `1.5px solid ${C.goldDeep}`, background: C.paper, color: C.goldDeep, borderRadius: 10, padding: "11px 8px", fontWeight: 700, fontSize: 13.5 }}
              >
                ↻ Preciso repetir
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center" }}>
        {cards.map((c, i) => {
          const p = pron[c.key] || 0;
          return (
            <button
              key={c.key}
              onClick={() => setIdx(i)}
              title={c.en}
              style={{
                width: 26, height: 26, borderRadius: 7, fontSize: 11, fontWeight: 700,
                border: `1.5px solid ${i === idx ? C.card : C.line}`,
                background: p >= 80 ? C.ok : p > 0 ? C.gold : C.paper,
                color: p > 0 ? "#fff" : C.inkSoft,
              }}
            >
              {p >= 80 ? "✓" : i + 1}
            </button>
          );
        })}
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: C.inkSoft, marginTop: 8 }}>
        Verde = 80% ou mais. Dourado = tentou, dá pra melhorar.
      </p>
    </div>
  );
}

function PronBtn({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1.5px solid ${C.card}`, background: C.paper, color: C.card,
        borderRadius: 10, padding: "11px 16px", fontWeight: 700, fontSize: 14.5,
      }}
    >
      {label}
    </button>
  );
}

// ===================== ABA META DO DIA (deck híbrido da Fase 1) =====================
function MetaDoDiaTab({ terms, srs, pron, daily, studyCard, savePron, setPace }) {
  const [queue, setQueue] = useState([]);       // [{ key, isNew }]
  const [sessionDone, setSessionDone] = useState(false);
  const [showPace, setShowPace] = useState(false);

  const today = ymd(new Date());
  const introduced = daily.introduced || {};
  const introducedToday = Object.values(introduced).filter((d) => d === today).length;
  const totalIntroduced = Object.keys(introduced).length;
  const pace = daily.pace;
  const goalMet = introducedToday >= pace;

  // Monta a sessão UMA vez ao abrir a aba: termos novos até bater a cota do dia,
  // depois as revisões vencidas (repetição espaçada).
  useEffect(() => {
    const now = Date.now();
    const isIntro = (k) => !!introduced[k];
    const newQuota = Math.max(0, pace - introducedToday);
    const newBatch = terms.filter((t) => !isIntro(t.key)).slice(0, newQuota).map((t) => ({ key: t.key, isNew: true }));
    const reviews = terms.filter((t) => {
      if (!isIntro(t.key)) return false;
      const s = srs[t.key];
      if (!s) return true;
      if (s.r < 2) return true;
      return s.due <= now;
    }).map((t) => ({ key: t.key, isNew: false }));
    const q = [...newBatch, ...reviews];
    setQueue(q);
    setSessionDone(q.length === 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byKey = (k) => terms.find((t) => t.key === k);
  const currentItem = queue[0];
  const current = currentItem ? byKey(currentItem.key) : null;
  const newsLeft = queue.filter((q) => q.isNew).length;
  const reviewsLeft = queue.filter((q) => !q.isNew).length;

  const handleRate = (r) => {
    if (!currentItem) return;
    studyCard(currentItem.key, r, currentItem.isNew);
    setQueue((q) => {
      const rest = q.slice(1);
      if (r === 0) { const nq = [...rest]; nq.splice(Math.min(3, nq.length), 0, currentItem); return nq; } // "De novo" volta pra fila
      if (rest.length === 0) setSessionDone(true);
      return rest;
    });
  };

  const pullMore = () => {
    const next = terms
      .filter((t) => !introduced[t.key] && !queue.some((q) => q.key === t.key))
      .slice(0, pace)
      .map((t) => ({ key: t.key, isNew: true }));
    if (next.length) { setQueue(next); setSessionDone(false); }
  };

  // Praticar um termo específico ao tocar no quadradinho do mapa.
  const studyOne = (key) => {
    const isNew = !introduced[key];
    setQueue((q) => [{ key, isNew }, ...q.filter((x) => x.key !== key)]);
    setSessionDone(false);
  };

  const newTermsRemaining = terms.filter((t) => !introduced[t.key]).length;
  const barPct = Math.min(100, Math.round((introducedToday / pace) * 100));

  // Streak "vivo": quebra se o último dia batido não foi hoje nem ontem (virada de dia).
  const yesterday = ymd(addDays(new Date(), -1));
  const streakAlive = daily.lastGoalDay === today || daily.lastGoalDay === yesterday;
  const streak = streakAlive ? (daily.streak || 0) : 0;
  const bestStreak = daily.bestStreak || 0;
  const MILESTONES = [3, 7, 14, 30];
  const nextMilestone = MILESTONES.find((m) => m > streak);
  const spokenWell = terms.filter((t) => (pron[t.key] || 0) >= 80).length;
  const allGreen = terms.length > 0 && spokenWell === terms.length;

  return (
    <div>
      {allGreen && (
        <div style={{ background: C.ok, borderRadius: 14, padding: "14px 16px", marginBottom: 14, color: "#fff", textAlign: "center" }}>
          <div style={{ fontFamily: FONT_HEAD, fontSize: 18, fontWeight: 700 }}>🎉 Fase 1 dominada na fala!</div>
          <div style={{ fontSize: 12.5, marginTop: 3, color: "#EAF3EC" }}>
            Todos os {terms.length} termos verdes. A prova do Júnior está liberada — role até o fim para fazê-la.
          </div>
        </div>
      )}

      {/* Cabeçalho: streak + progresso do dia + ajuste de ritmo */}
      <div style={{ background: C.card, borderRadius: 14, padding: "14px 16px", marginBottom: 14, color: C.cream }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700 }}>
            {streak > 0 ? "🔥" : "🌱"} {streak} {streak === 1 ? "dia seguido" : "dias seguidos"}
            {bestStreak > streak && (
              <span style={{ fontSize: 11.5, fontWeight: 600, color: C.gold, marginLeft: 6 }}>· recorde {bestStreak}</span>
            )}
          </span>
          <button onClick={() => setShowPace((s) => !s)}
            style={{ background: "rgba(239,233,218,0.14)", border: "none", color: C.gold, borderRadius: 8, padding: "5px 10px", fontWeight: 700, fontSize: 12.5 }}>
            ⚙️ Ritmo: {pace}/dia
          </button>
        </div>
        <div style={{ height: 9, background: "rgba(0,0,0,0.25)", borderRadius: 5, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${barPct}%`, background: goalMet ? C.okSoft : C.gold, borderRadius: 5, transition: "width .3s ease" }} />
        </div>
        <div style={{ fontSize: 12.5, color: "#DDE4DA", marginTop: 7 }}>
          {goalMet ? "✓ Meta do dia batida! " : ""}{introducedToday}/{pace} termos novos hoje · {totalIntroduced}/{terms.length} no total
        </div>
        {streak > 0 && nextMilestone && (
          <div style={{ fontSize: 11.5, color: C.gold, marginTop: 3 }}>
            🏅 Faltam {nextMilestone - streak} {nextMilestone - streak === 1 ? "dia" : "dias"} para o marco de {nextMilestone} dias.
          </div>
        )}
        {streak === 0 && bestStreak > 0 && (
          <div style={{ fontSize: 11.5, color: C.gold, marginTop: 3 }}>
            Streak zerado — bata a meta hoje para recomeçar. Seu recorde é {bestStreak} dias.
          </div>
        )}

        {showPace && (
          <div style={{ marginTop: 12, borderTop: "1px solid rgba(239,233,218,0.18)", paddingTop: 12 }}>
            <div style={{ fontSize: 12, color: "#DDE4DA", marginBottom: 8 }}>Quantos termos NOVOS por dia?</div>
            <div style={{ display: "flex", gap: 5 }}>
              {PACE_STOPS.map((p) => (
                <button key={p.v} onClick={() => setPace(p.v)}
                  style={{
                    flex: 1, border: `1.5px solid ${pace === p.v ? C.gold : "rgba(239,233,218,0.3)"}`,
                    background: pace === p.v ? C.gold : "transparent", color: pace === p.v ? C.card : C.cream,
                    borderRadius: 9, padding: "8px 2px", fontWeight: 700, fontSize: 14,
                  }}>
                  {p.v}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.gold, fontWeight: 600, marginTop: 8, textAlign: "center" }}>
              {(PACE_STOPS.find((p) => p.v === pace) || PACE_STOPS[2]).label} · {(PACE_STOPS.find((p) => p.v === pace) || PACE_STOPS[2]).hint}
            </div>
          </div>
        )}
      </div>

      {sessionDone || !current ? (
        <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 16, padding: "30px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>{goalMet ? "🎉" : "☕"}</div>
          <div style={{ fontFamily: FONT_HEAD, fontSize: 21, fontWeight: 700, color: C.card, margin: "8px 0 6px" }}>
            {goalMet ? "Meta do dia concluída!" : "Sessão em dia"}
          </div>
          <p style={{ fontSize: 14, color: C.inkSoft, margin: "0 0 14px", lineHeight: 1.5 }}>
            {goalMet
              ? `Você fixou ${introducedToday} termos hoje e manteve o streak em ${daily.streak || 0}. As revisões voltam sozinhas quando o intervalo vencer.`
              : "Nada pendente agora. Volte quando as revisões vencerem."}
            {newTermsRemaining === 0 && " 🏆 Você já viu todos os termos da Fase 1!"}
          </p>
          {newTermsRemaining > 0 && (
            <button onClick={pullMore}
              style={{ border: `1.5px solid ${C.goldDeep}`, background: C.paper, color: C.goldDeep, borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13.5 }}>
              Puxar +{Math.min(pace, newTermsRemaining)} termos agora
              <span style={{ display: "block", fontSize: 11, fontWeight: 500, color: C.inkSoft, marginTop: 2 }}>adianta o de amanhã · mais volume, menos retenção</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
            {newsLeft > 0 && <span style={{ color: C.goldDeep }}>{newsLeft} {newsLeft === 1 ? "novo" : "novos"}</span>}
            {newsLeft > 0 && reviewsLeft > 0 && " · "}
            {reviewsLeft > 0 && <span>{reviewsLeft} {reviewsLeft === 1 ? "revisão" : "revisões"}</span>}
            {" na fila · "}{current.theme}
          </div>
          <HybridCard
            key={current.key}
            term={current}
            isNew={currentItem.isNew}
            pronBest={pron[current.key] || 0}
            savePron={savePron}
            onRate={handleRate}
          />
        </>
      )}

      {/* Mapa da fala: como cada termo foi FALADO. Toque para praticar de novo. */}
      <div style={{ marginTop: 18, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 12px 10px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, marginBottom: 8 }}>🎤 Mapa da fala</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {terms.map((t, i) => {
            const p = pron[t.key] || 0;
            const seen = !!introduced[t.key];
            const isCurrent = current && current.key === t.key;
            const bg = p >= 80 ? C.ok : p > 0 ? C.gold : C.paper;
            const spokenPending = seen && p === 0; // visto mas ainda não falado (ou "pulado")
            return (
              <button
                key={t.key}
                onClick={() => studyOne(t.key)}
                title={`${t.term} — ${p >= 80 ? "falado bem" : p > 0 ? `falado ${p}%` : spokenPending ? "visto, fala pendente" : "não visto"}`}
                style={{
                  width: 26, height: 26, borderRadius: 7, fontSize: 11, fontWeight: 700,
                  border: isCurrent ? `2px solid ${C.card}` : spokenPending ? `1.5px dashed ${C.goldDeep}` : `1.5px solid ${C.line}`,
                  background: bg,
                  color: p > 0 ? "#fff" : spokenPending ? C.goldDeep : C.inkSoft,
                  opacity: seen || p > 0 ? 1 : 0.45,
                }}
              >
                {p >= 80 ? "✓" : spokenPending ? "!" : i + 1}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
          <b style={{ color: C.ok }}>✓ verde</b> falou bem (≥80%) · <b style={{ color: C.goldDeep }}>dourado</b> dá pra melhorar · <b style={{ color: C.goldDeep }}>! tracejado</b> visto mas fala pendente · apagado = não visto
        </div>
        {(() => {
          const green = terms.filter((t) => (pron[t.key] || 0) >= 80).length;
          const allGreen = green === terms.length;
          return (
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: allGreen ? C.ok : C.goldDeep, textAlign: "center" }}>
              {allGreen ? "🔓 Prova liberada! Todos os termos falados bem." : `🔒 Prova libera com todos verdes — ${green}/${terms.length}`}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// Card híbrido: termo em destaque + frase âncora + ouvir/falar + avaliação SRS.
function HybridCard({ term, isNew, pronBest, savePron, onRate }) {
  const [flipped, setFlipped] = useState(false);
  const {
    listening, starting, liveText, result, srError, selfMode, audioUrl,
    myAudioRef, speak, playMine, listen, stopListening,
  } = useSpeech(term.phrase, (pct) => savePron(term.key, pct));

  const roleLabel = term.role === "cust" ? "👂 O cliente diz" : "🗣 Você diz";
  const fb = result
    ? result.pct >= 80 ? { t: "Pronúncia clara!", c: C.ok } : result.pct >= 60 ? { t: "Quase lá.", c: "#B4842D" } : { t: "Repita devagar.", c: C.bad }
    : null;

  return (
    <div style={{ background: C.paper, border: `1.5px solid ${isNew ? C.goldDeep : C.line}`, borderRadius: 16, padding: "22px 18px", boxShadow: "0 4px 14px rgba(32,52,42,0.10)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.goldDeep, fontWeight: 700 }}>
          {isNew ? "✨ Termo novo" : "🔁 Revisão"} · {term.theme}
        </span>
        {pronBest > 0 && <span style={{ fontSize: 11.5, color: pronBest >= 80 ? C.ok : C.goldDeep, fontWeight: 700 }}>🎤 {pronBest}%</span>}
      </div>

      {/* Termo em destaque */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>{term.term}</div>
        {flipped && <div style={{ fontSize: 15, color: C.goldDeep, fontWeight: 600, marginTop: 4 }}>{term.termPt}</div>}
      </div>

      {!flipped ? (
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <button onClick={() => setFlipped(true)}
            style={{ border: "none", background: C.card, color: C.cream, borderRadius: 10, padding: "11px 20px", fontWeight: 700, fontSize: 14.5 }}>
            Ver significado e uso
          </button>
          <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 10 }}>Você lembra o que significa e como usar?</div>
        </div>
      ) : (
        <>
          {/* Frase âncora */}
          <div style={{ marginTop: 16, background: C.bg, borderRadius: 12, padding: "14px 14px" }}>
            <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.goldDeep, fontWeight: 700, marginBottom: 6 }}>{roleLabel}</div>
            <div style={{ fontFamily: FONT_HEAD, fontSize: 18, fontWeight: 600, lineHeight: 1.4 }}>
              {result
                ? term.phrase.split(" ").map((w, i) => (
                    <span key={i} style={{ color: result.displayHits[i] ? C.ok : C.bad }}>{w} </span>
                  ))
                : <span style={{ color: C.ink }}>{term.phrase}</span>}
            </div>
            <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>{term.phrasePt}</div>
            {result && (
              <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 5 }}>
                🟢 falou bem · 🔴 repita — <i>ouvi: "{result.transcript}"</i>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
              <PronBtn onClick={() => speak(0.95)} label="🔊 Ouvir" />
              <PronBtn onClick={() => speak(0.6)} label="🐢 Devagar" />
              {listening ? (
                <button onClick={stopListening}
                  style={{ border: "none", borderRadius: 10, padding: "11px 18px", fontWeight: 700, fontSize: 14.5, background: starting ? C.goldDeep : C.bad, color: C.cream }}>
                  {starting ? "⏳ Preparando…" : "⏹ Parar"}
                </button>
              ) : (
                <button onClick={listen}
                  style={{ border: "none", borderRadius: 10, padding: "11px 18px", fontWeight: 700, fontSize: 14.5, background: C.card, color: C.cream }}>
                  🎤 Falar
                </button>
              )}
            </div>

            {listening && (
              <div style={{ marginTop: 10, background: C.paper, borderRadius: 10, padding: "9px 11px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: starting ? C.goldDeep : C.bad }}>
                  {starting ? "⏳ Preparando o microfone…" : "🔴 Ouvindo… fale e toque em Parar"}
                </div>
                {liveText && <div style={{ fontSize: 13, color: C.ink, fontStyle: "italic", marginTop: 4 }}>“{liveText}”</div>}
              </div>
            )}
            {audioUrl && !listening && (
              <div style={{ marginTop: 10, textAlign: "center" }}>
                <PronBtn onClick={playMine} label="▶️ Ouvir minha fala" />
                <audio ref={myAudioRef} src={audioUrl} preload="auto" style={{ display: "none" }} />
              </div>
            )}
            {result && (
              <div style={{ marginTop: 10, textAlign: "center" }}>
                <span style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 700, color: fb.c }}>{result.pct}%</span>
                <span style={{ fontSize: 12.5, color: fb.c, fontWeight: 600, marginLeft: 8 }}>{fb.t}</span>
              </div>
            )}
            {srError && (
              <div style={{ marginTop: 10, fontSize: 12.5, color: C.bad, lineHeight: 1.5, background: "#FBF1EA", borderRadius: 10, padding: "9px 11px" }}>{srError}</div>
            )}

            {selfMode && (
              <div style={{ marginTop: 10, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: C.card, marginBottom: 4, textAlign: "center" }}>🪞 Autoavaliação da fala</div>
                <div style={{ fontSize: 11.5, color: C.inkSoft, textAlign: "center", marginBottom: 8, lineHeight: 1.4 }}>
                  Toque em Ouvir, repita imitando o ritmo, e seja honesto:
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => savePron(term.key, 80)}
                    style={{ flex: 1, border: `1.5px solid ${C.ok}`, background: C.paper, color: C.ok, borderRadius: 10, padding: "10px 6px", fontWeight: 700, fontSize: 13 }}>
                    ✓ Falei com confiança
                  </button>
                  <button onClick={() => savePron(term.key, 40)}
                    style={{ flex: 1, border: `1.5px solid ${C.goldDeep}`, background: C.paper, color: C.goldDeep, borderRadius: 10, padding: "10px 6px", fontWeight: 700, fontSize: 13 }}>
                    ↻ Preciso repetir
                  </button>
                </div>
              </div>
            )}
          </div>

        </>
      )}

      {/* Avaliação SRS — sempre visível, já quando o termo em inglês aparece.
          Você pode se avaliar de cara (se já sabe) ou ver o significado antes. */}
      <div style={{ fontSize: 12, color: C.inkSoft, textAlign: "center", margin: "16px 0 8px", fontWeight: 600 }}>
        {flipped ? "Quão bem você domina este termo?" : "Já sabe? Avalie — ou veja o significado antes."}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {RATINGS.map((rt, i) => (
          <button key={i} onClick={() => onRate(i)}
            style={{ flex: 1, border: "none", background: rt.color, color: "#fff", borderRadius: 10, padding: "10px 2px", fontWeight: 700, fontSize: 12.5, lineHeight: 1.25 }}>
            {rt.label}
            <span style={{ display: "block", fontSize: 10, fontWeight: 500, opacity: 0.9 }}>{rt.sub}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ===================== ABA DINÂMICA =====================
function DynTab({ level, best, saveDyn }) {
  const dyn = DYNAMICS[level.id];
  const [scnIdx, setScnIdx] = useState(0);
  const [phase, setPhase] = useState("brief"); // brief | evaluate | result
  const [checks, setChecks] = useState(dyn.checklist.map(() => false));
  const scn = dyn.scenarios[scnIdx];

  const sortear = () => {
    let next = Math.floor(Math.random() * dyn.scenarios.length);
    if (dyn.scenarios.length > 1 && next === scnIdx) next = (next + 1) % dyn.scenarios.length;
    setScnIdx(next);
    setPhase("brief");
    setChecks(dyn.checklist.map(() => false));
  };

  const finish = () => {
    setPhase("result");
    const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    saveDyn(level.id, pct);
  };

  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  if (phase === "result") {
    const good = pct >= 80;
    return (
      <div style={{ background: good ? C.card : C.paper, border: good ? "none" : `1.5px solid ${C.bad}`, borderRadius: 16, padding: "28px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>{good ? "🎭🏆" : "🎭"}</div>
        <div style={{ fontFamily: FONT_HEAD, fontSize: 26, fontWeight: 700, color: good ? C.gold : C.bad, margin: "8px 0 4px" }}>
          {pct}%
        </div>
        <p style={{ fontSize: 14, color: good ? "#DDE4DA" : C.inkSoft, margin: "0 0 16px", lineHeight: 1.5 }}>
          {good
            ? "Dinâmica aprovada! O consultor dominou o cenário em inglês."
            : "Revisem juntos os itens que faltaram e repitam o cenário — a repetição é o treino."}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setPhase("evaluate"); }} style={{ flex: 1, border: `1.5px solid ${good ? C.gold : C.card}`, background: "transparent", color: good ? C.gold : C.card, borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 14 }}>
            Ver checklist
          </button>
          <button onClick={sortear} style={{ flex: 1, border: "none", background: good ? C.gold : C.card, color: good ? C.card : C.cream, borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 14 }}>
            Novo cenário
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>
          <b style={{ color: C.card }}>Como funciona:</b> em dupla, um faz o <b>cliente</b> (segura o celular e segue o perfil + imprevisto) e o outro é o <b>consultor</b> (sem olhar a tela!). Um terceiro colega — ou o próprio "cliente" no final — preenche o checklist.
          {best ? <span> · Melhor nota da equipe: <b style={{ color: best >= 80 ? C.ok : C.goldDeep }}>{best}%</b></span> : null}
        </div>
      </div>

      {phase === "brief" && (
        <div>
          <div style={{ background: C.card, borderRadius: 16, padding: "18px 18px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontFamily: FONT_HEAD, fontSize: 20, fontWeight: 700, color: C.gold }}>
                🎬 {scn.title}
              </span>
              <span style={{ fontSize: 11.5, color: "#B9C4B6", fontWeight: 700 }}>{scnIdx + 1}/{dyn.scenarios.length}</span>
            </div>

            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: 4 }}>
              👤 Perfil do cliente (quem interpreta lê isto)
            </div>
            <p style={{ fontSize: 14, color: C.cream, lineHeight: 1.55, margin: "0 0 12px" }}>{scn.customer}</p>

            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: 4 }}>
              🎯 Missão do consultor
            </div>
            <p style={{ fontSize: 14, color: C.cream, lineHeight: 1.55, margin: "0 0 12px" }}>{scn.mission}</p>

            <div style={{ background: C.cardSoft, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.gold, fontWeight: 700, marginBottom: 4 }}>
                🌀 Imprevisto (só o cliente lê!)
              </div>
              <p style={{ fontSize: 13.5, color: "#DDE4DA", lineHeight: 1.5, margin: 0 }}>{scn.twist}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={sortear} style={{ flex: 1, border: `1.5px solid ${C.card}`, background: C.paper, color: C.card, borderRadius: 12, padding: "13px 0", fontWeight: 700, fontSize: 14 }}>
              🎲 Sortear outro
            </button>
            <button onClick={() => setPhase("evaluate")} style={{ flex: 1, border: "none", background: C.gold, color: C.card, borderRadius: 12, padding: "13px 0", fontWeight: 700, fontSize: 14 }}>
              Começou! Avaliar →
            </button>
          </div>
        </div>
      )}

      {phase === "evaluate" && (
        <div>
          <div style={{ fontFamily: FONT_HEAD, fontSize: 18, fontWeight: 700, color: C.card, marginBottom: 4 }}>
            Checklist do avaliador · {scn.title}
          </div>
          <p style={{ fontSize: 12.5, color: C.inkSoft, margin: "0 0 12px", lineHeight: 1.5 }}>
            Marque o que o consultor cumpriu durante o atendimento:
          </p>
          {dyn.checklist.map((item, i) => (
            <button
              key={i}
              onClick={() => setChecks(checks.map((c, k) => (k === i ? !c : c)))}
              style={{
                display: "flex", alignItems: "flex-start", gap: 10, width: "100%", textAlign: "left",
                background: checks[i] ? "#EAF2EB" : C.paper,
                border: `1.5px solid ${checks[i] ? C.ok : C.line}`,
                borderRadius: 12, padding: "12px 14px", marginBottom: 8, fontSize: 14, lineHeight: 1.4, color: C.ink,
              }}
            >
              <span style={{
                minWidth: 22, height: 22, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center",
                border: `1.5px solid ${checks[i] ? C.ok : C.line}`,
                background: checks[i] ? C.ok : "transparent", color: "#fff", fontWeight: 700, fontSize: 13,
              }}>
                {checks[i] ? "✓" : ""}
              </span>
              {item}
            </button>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0 12px", fontSize: 13.5, fontWeight: 700, color: C.inkSoft }}>
            <span>Cumpridos: {checks.filter(Boolean).length}/{checks.length}</span>
            <span style={{ color: pct >= 80 ? C.ok : C.goldDeep }}>{pct}%</span>
          </div>
          <button onClick={finish} style={{ width: "100%", border: "none", background: C.gold, color: C.card, borderRadius: 12, padding: "14px 0", fontWeight: 700, fontSize: 15.5, fontFamily: FONT_HEAD }}>
            Finalizar avaliação
          </button>
        </div>
      )}
    </div>
  );
}

// ===================== QUIZ =====================
function Quiz({ level, qIndex, picked, setPicked, answers, finished, onConfirm, onBack, onHome, onRetry }) {
  const pass = passFor(level);
  if (finished) {
    const score = answers.filter((a, i) => a === level.quiz[i].a).length;
    const passed = score >= pass;
    return (
      <div>
        <div style={{
          background: passed ? C.card : C.paper,
          border: passed ? "none" : `1.5px solid ${C.bad}`,
          borderRadius: 18, padding: "28px 20px", textAlign: "center", marginBottom: 18,
        }}>
          <div style={{ fontSize: 44 }}>{passed ? "🏆" : "📚"}</div>
          <div style={{ fontFamily: FONT_HEAD, fontSize: 26, fontWeight: 700, color: passed ? C.gold : C.bad, margin: "8px 0 4px" }}>
            {score}/{level.quiz.length} {passed ? "— Aprovado!" : "— Quase lá"}
          </div>
          <p style={{ fontSize: 14, color: passed ? "#DDE4DA" : C.inkSoft, margin: 0, lineHeight: 1.5 }}>
            {passed
              ? level.id < 3
                ? `Nível ${level.id + 1} desbloqueado. Continue o treinamento!`
                : "Treinamento completo. Agora é repetir até virar automático no balcão."
              : `Você precisa de ${pass} acertos. Revise os cards e tente de novo — errar aqui é melhor que errar com o cliente.`}
          </p>
        </div>

        <div style={{ marginBottom: 18 }}>
          {level.quiz.map((q, i) => {
            const correct = answers[i] === q.a;
            return (
              <div key={i} style={{ background: C.paper, border: `1px solid ${correct ? C.line : C.bad}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, marginBottom: 4 }}>
                  {correct ? "✓" : "✗"} {i + 1}. {q.q}
                </div>
                {!correct && <div style={{ fontSize: 13, color: C.bad }}>Sua resposta: {q.opts[answers[i]]}</div>}
                <div style={{ fontSize: 13, color: C.ok, fontWeight: 600 }}>Correto: {q.opts[q.a]}</div>
                {q.note && <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 3, lineHeight: 1.4 }}>{q.note}</div>}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onRetry} style={{ flex: 1, background: C.paper, border: `1.5px solid ${C.card}`, color: C.card, borderRadius: 12, padding: "13px 0", fontWeight: 700, fontSize: 15 }}>
            Refazer prova
          </button>
          <button onClick={onHome} style={{ flex: 1, background: C.card, border: "none", color: C.cream, borderRadius: 12, padding: "13px 0", fontWeight: 700, fontSize: 15 }}>
            {passed && level.id < 3 ? `Ir ao Nível ${level.id + 1}` : "Voltar aos níveis"}
          </button>
        </div>
      </div>
    );
  }

  const q = level.quiz[qIndex];
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.goldDeep, fontWeight: 700, fontSize: 14, padding: 0, marginBottom: 12 }}>
        ← Voltar ao nível
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 19, color: C.card }}>Prova · Nível {level.id}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.goldDeep }}>{qIndex + 1}/{level.quiz.length}</span>
      </div>
      <div style={{ height: 6, background: "#DCE1D6", borderRadius: 4, marginBottom: 20 }}>
        <div style={{ height: "100%", width: `${(qIndex / level.quiz.length) * 100}%`, background: C.gold, borderRadius: 4, transition: "width .25s ease" }} />
      </div>

      <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: "16px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 16.5, fontWeight: 600, color: C.ink, lineHeight: 1.45 }}>{q.q}</div>
      </div>

      {q.opts.map((opt, i) => (
        <button
          key={i}
          onClick={() => setPicked(i)}
          style={{
            display: "block", width: "100%", textAlign: "left",
            background: picked === i ? C.card : C.paper,
            color: picked === i ? C.cream : C.ink,
            border: `1.5px solid ${picked === i ? C.card : C.line}`,
            borderRadius: 12, padding: "13px 14px", marginBottom: 10, fontSize: 14.5, lineHeight: 1.4,
          }}
        >
          <b style={{ color: picked === i ? C.gold : C.goldDeep, marginRight: 8 }}>{String.fromCharCode(65 + i)}</b>
          {opt}
        </button>
      ))}

      <button
        onClick={onConfirm}
        disabled={picked === null}
        style={{
          width: "100%", marginTop: 6,
          background: picked === null ? "#D8DCD2" : C.gold,
          color: picked === null ? C.inkSoft : C.card,
          border: "none", borderRadius: 12, padding: "15px 0",
          fontSize: 16, fontWeight: 700, fontFamily: FONT_HEAD,
        }}
      >
        {qIndex + 1 === level.quiz.length ? "Finalizar prova" : "Confirmar resposta"}
      </button>
    </div>
  );
}
