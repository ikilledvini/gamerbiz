import type { LangCode } from "@/i18n";

export type LegalSection = {
  title: string;
  paragraphs: string[];
  items?: string[];
};

export type LegalDocument = {
  eyebrow: string;
  title: string;
  description: string;
  effectiveDateLabel: string;
  effectiveDate: string;
  sections: LegalSection[];
};

export type LegalContent = {
  navigationLabel: string;
  privacyLabel: string;
  termsLabel: string;
  backHome: string;
  privacy: LegalDocument;
  terms: LegalDocument;
};

const COMPANY = {
  pt: "Gamerbiz, inscrita no CNPJ 41.605.881/0001-51, com sede na Rua Cel. Conrado Siqueira Campos, 133, apto. 103, Jardim das Acácias, São Paulo/SP, CEP 04704-900",
  en: "Gamerbiz, enrolled under Brazilian CNPJ 41.605.881/0001-51, headquartered at Rua Cel. Conrado Siqueira Campos, 133, apt. 103, Jardim das Acácias, São Paulo/SP, Brazil, ZIP 04704-900",
  es: "Gamerbiz, inscrita en el CNPJ brasileño 41.605.881/0001-51, con domicilio en Rua Cel. Conrado Siqueira Campos, 133, apto. 103, Jardim das Acácias, São Paulo/SP, Brasil, CEP 04704-900",
  zh: "Gamerbiz（巴西 CNPJ 注册号 41.605.881/0001-51，地址：Rua Cel. Conrado Siqueira Campos, 133, apto. 103, Jardim das Acácias, São Paulo/SP, Brazil, CEP 04704-900）",
};

export const LEGAL_CONTENT: Record<LangCode, LegalContent> = {
  "pt-BR": {
    navigationLabel: "Documentos legais",
    privacyLabel: "Política de privacidade",
    termsLabel: "Termos de serviço",
    backHome: "Voltar ao início",
    privacy: {
      eyebrow: "GAMERBIZ · PRIVACIDADE",
      title: "Política de Privacidade",
      description:
        "Entenda como a Gamerbiz coleta, utiliza, compartilha e protege dados pessoais em seu site, portais e Media Kits.",
      effectiveDateLabel: "Vigente desde",
      effectiveDate: "13 de agosto de 2026",
      sections: [
        {
          title: "1. Quem controla seus dados",
          paragraphs: [
            `${COMPANY.pt} é a controladora dos dados pessoais tratados nos serviços Gamerbiz. Solicitações relacionadas à privacidade podem ser enviadas para contato@gamerbiz.com.br.`,
          ],
        },
        {
          title: "2. Dados que podemos coletar",
          paragraphs: [
            "Coletamos somente os dados necessários para operar o site, atender contatos comerciais, administrar Media Kits e permitir que creators conectem contas de redes sociais.",
          ],
          items: [
            "Dados cadastrais e de contato, como nome, e-mail, telefone, empresa e cargo.",
            "Dados de autenticação e administração, como identificador da conta, função de acesso e registros de login. Senhas são processadas pelo provedor de autenticação e não são exibidas à Gamerbiz.",
            "Dados profissionais e públicos de creators, como nome artístico, biografia, imagem, cidade, categoria e links de perfis.",
            "Métricas autorizadas de redes sociais, como seguidores, visualizações, curtidas, comentários, compartilhamentos e dados de audiência disponibilizados pelas APIs oficiais.",
            "Dados técnicos, como endereço IP, navegador, dispositivo, páginas acessadas, data e hora, falhas e registros de segurança.",
            "Informações enviadas voluntariamente em formulários, propostas, candidaturas ou mensagens.",
          ],
        },
        {
          title: "3. Como utilizamos os dados",
          paragraphs: ["Podemos tratar dados pessoais para as seguintes finalidades:"],
          items: [
            "Disponibilizar, autenticar, proteger e manter o site, o painel administrativo e o portal do creator.",
            "Criar, publicar e atualizar Media Kits e métricas autorizadas.",
            "Responder contatos, avaliar candidaturas e desenvolver propostas ou campanhas.",
            "Cumprir contratos, obrigações legais e regulatórias e exercer direitos em processos.",
            "Prevenir fraude, abuso, incidentes e acesso não autorizado.",
            "Melhorar desempenho, acessibilidade e experiência do serviço com dados agregados ou estritamente necessários.",
          ],
        },
        {
          title: "4. Bases legais",
          paragraphs: [
            "Conforme a LGPD, utilizamos bases legais adequadas a cada atividade, incluindo execução de contrato ou procedimentos preliminares, cumprimento de obrigação legal, legítimo interesse com avaliação dos direitos do titular, exercício regular de direitos e consentimento quando exigido. O consentimento pode ser revogado, sem afetar tratamentos anteriores legítimos.",
          ],
        },
        {
          title: "5. Integrações com redes sociais",
          paragraphs: [
            "Ao conectar uma conta do YouTube, TikTok ou outra plataforma, o creator é direcionado ao ambiente oficial dessa plataforma para autorizar os escopos apresentados. A Gamerbiz recebe tokens de acesso e dados permitidos pela autorização, não a senha da rede social.",
            "Os tokens são usados para sincronizar as métricas do Media Kit e podem ser renovados enquanto a conexão estiver ativa. O creator pode revogar a autorização nas configurações da plataforma ou solicitar a desconexão à Gamerbiz. A revogação pode impedir futuras atualizações, mas não exige apagar dados cuja retenção seja necessária por lei ou para exercício de direitos.",
          ],
        },
        {
          title: "6. Compartilhamento e operadores",
          paragraphs: [
            "Podemos compartilhar dados com fornecedores que apoiam hospedagem, banco de dados, autenticação, segurança, comunicação, armazenamento e APIs sociais, sempre no limite necessário à prestação do serviço. Atualmente, isso pode incluir Supabase, provedores de hospedagem e as plataformas conectadas pelo próprio usuário.",
            "Também podemos compartilhar informações quando exigido por lei, autoridade competente, proteção de direitos ou em operação societária legítima. Não vendemos dados pessoais.",
          ],
        },
        {
          title: "7. Transferências internacionais",
          paragraphs: [
            "Alguns fornecedores e redes sociais podem processar dados fora do Brasil. Nesses casos, adotamos mecanismos compatíveis com a LGPD e medidas contratuais e de segurança adequadas, conforme aplicável.",
          ],
        },
        {
          title: "8. Retenção e exclusão",
          paragraphs: [
            "Mantemos os dados pelo tempo necessário às finalidades informadas, à vigência da relação, ao cumprimento de obrigações legais, à prevenção de fraude e ao exercício de direitos. Encerrada a necessidade, os dados são excluídos, anonimizados ou mantidos de forma segura quando a legislação autorizar.",
          ],
        },
        {
          title: "9. Segurança",
          paragraphs: [
            "Aplicamos controles técnicos e organizacionais proporcionais aos riscos, incluindo controle de acesso, autenticação, registros de segurança e proteção de credenciais. Nenhum sistema é totalmente imune; em incidentes relevantes, adotaremos as medidas legais e técnicas cabíveis.",
          ],
        },
        {
          title: "10. Seus direitos",
          paragraphs: [
            "Nos termos da LGPD, você pode solicitar confirmação e acesso ao tratamento, correção, anonimização, bloqueio ou eliminação quando aplicável, portabilidade conforme regulamentação, informação sobre compartilhamentos, revisão de decisões automatizadas, oposição e revogação do consentimento.",
            "Envie a solicitação para contato@gamerbiz.com.br. Podemos pedir informações para confirmar sua identidade e proteger os dados contra acesso indevido. Você também pode peticionar à Autoridade Nacional de Proteção de Dados (ANPD).",
          ],
        },
        {
          title: "11. Cookies e armazenamento local",
          paragraphs: [
            "Utilizamos recursos estritamente necessários, como armazenamento local da preferência de idioma e elementos de sessão/autenticação. Caso ferramentas opcionais de análise ou publicidade sejam adicionadas, esta política e os mecanismos de escolha serão atualizados quando exigido.",
          ],
        },
        {
          title: "12. Crianças e adolescentes",
          paragraphs: [
            "Os portais de gestão não são destinados a crianças. O tratamento de dados de menores em campanhas ou Media Kits deve observar o melhor interesse, as autorizações e as demais exigências legais aplicáveis.",
          ],
        },
        {
          title: "13. Alterações e contato",
          paragraphs: [
            "Podemos atualizar esta política para refletir mudanças legais, técnicas ou operacionais. A versão vigente e sua data estarão sempre nesta página. Dúvidas ou solicitações podem ser enviadas para contato@gamerbiz.com.br.",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "GAMERBIZ · TERMOS",
      title: "Termos de Serviço",
      description:
        "Regras para acesso e uso do site, portais, Media Kits e integrações oferecidos pela Gamerbiz.",
      effectiveDateLabel: "Vigente desde",
      effectiveDate: "13 de agosto de 2026",
      sections: [
        {
          title: "1. Aceitação e responsável",
          paragraphs: [
            `Estes Termos regulam o uso dos serviços digitais oferecidos por ${COMPANY.pt}. Ao acessar ou utilizar os serviços, você declara ter lido e concordado com estes Termos e com a Política de Privacidade.`,
          ],
        },
        {
          title: "2. Serviços",
          paragraphs: [
            "A Gamerbiz disponibiliza conteúdo institucional, canais de contato, Media Kits públicos e áreas autenticadas para administração e conexão autorizada de contas de creators. Recursos podem variar, ser atualizados ou descontinuados conforme necessidades operacionais e contratuais.",
          ],
        },
        {
          title: "3. Contas e acesso",
          paragraphs: [
            "Contas são criadas ou autorizadas pela Gamerbiz para pessoas vinculadas a suas operações. Você deve fornecer informações corretas, manter credenciais confidenciais, trocar senhas temporárias e comunicar imediatamente suspeitas de acesso indevido.",
            "Cada creator pode acessar somente os Media Kits e recursos associados à sua autorização. Administradores possuem permissões ampliadas conforme sua função. É proibido compartilhar contas, contornar controles ou acessar dados de terceiros sem autorização.",
          ],
        },
        {
          title: "4. Conexões e dados de redes sociais",
          paragraphs: [
            "Ao conectar uma rede social, você declara ter autorização sobre a conta e permite que a Gamerbiz consulte e atualize as métricas apresentadas pelos escopos de OAuth. A disponibilidade e precisão dependem das APIs e políticas de terceiros.",
            "Você pode revogar a conexão na plataforma correspondente. A revogação interrompe futuras sincronizações e pode limitar a funcionalidade do Media Kit.",
          ],
        },
        {
          title: "5. Conteúdo e autorizações",
          paragraphs: [
            "Você permanece responsável por informações, imagens, nomes, marcas, links e demais materiais fornecidos. Ao disponibilizá-los para um Media Kit ou campanha, concede à Gamerbiz autorização não exclusiva para hospedar, adaptar tecnicamente, exibir e distribuir o material na medida necessária à prestação dos serviços e à execução do relacionamento comercial.",
            "Você declara possuir os direitos e autorizações necessários e deve informar prontamente qualquer conteúdo incorreto, desatualizado ou cuja publicação deva cessar.",
          ],
        },
        {
          title: "6. Uso permitido",
          paragraphs: ["Você não pode:"],
          items: [
            "Usar os serviços para atividade ilegal, fraudulenta, abusiva, discriminatória ou que viole direitos de terceiros.",
            "Tentar invadir, testar vulnerabilidades sem autorização, interferir na segurança ou distribuir código malicioso.",
            "Copiar, extrair ou explorar sistematicamente dados e conteúdo fora das permissões concedidas.",
            "Impersonar terceiros, falsificar métricas ou fornecer informações enganosas.",
            "Remover avisos de propriedade ou utilizar marcas da Gamerbiz sem autorização.",
          ],
        },
        {
          title: "7. Propriedade intelectual",
          paragraphs: [
            "O site, identidade visual, software, estrutura, textos e materiais próprios são protegidos pela legislação de propriedade intelectual e pertencem à Gamerbiz ou a seus licenciadores. Estes Termos não transferem propriedade nem concedem licença além do uso normal dos serviços.",
          ],
        },
        {
          title: "8. Serviços de terceiros",
          paragraphs: [
            "Links, APIs e integrações de terceiros, como YouTube, TikTok e provedores de infraestrutura, estão sujeitos a seus próprios termos e políticas. A Gamerbiz não controla indisponibilidades, mudanças de API, suspensões ou decisões dessas plataformas.",
          ],
        },
        {
          title: "9. Disponibilidade e alterações",
          paragraphs: [
            "Buscamos manter os serviços seguros e disponíveis, mas não garantimos operação ininterrupta ou livre de erros. Podemos realizar manutenção, corrigir falhas, alterar funcionalidades e suspender acessos por segurança, obrigação legal, violação destes Termos ou término da relação aplicável.",
          ],
        },
        {
          title: "10. Responsabilidade",
          paragraphs: [
            "Na extensão permitida pela legislação, a Gamerbiz não responde por danos decorrentes de uso indevido, credenciais comprometidas por culpa do usuário, conteúdo ou serviços de terceiros, dados inexatos fornecidos por plataformas, indisponibilidade externa ou eventos fora de seu controle razoável.",
            "Nada nestes Termos exclui responsabilidades que não possam ser afastadas por lei, inclusive direitos assegurados por normas de proteção do consumidor quando aplicáveis.",
          ],
        },
        {
          title: "11. Encerramento",
          paragraphs: [
            "Você pode deixar de usar os serviços e solicitar o encerramento de sua conta pelos canais da Gamerbiz. Podemos restringir ou encerrar acesso em caso de violação, risco de segurança, obrigação legal ou fim do vínculo, preservando dados e direitos conforme a Política de Privacidade e a legislação.",
          ],
        },
        {
          title: "12. Lei aplicável e foro",
          paragraphs: [
            "Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de São Paulo/SP, ressalvado o foro legalmente assegurado ao consumidor quando aplicável.",
          ],
        },
        {
          title: "13. Alterações e contato",
          paragraphs: [
            "Podemos atualizar estes Termos. A versão vigente e sua data estarão nesta página; mudanças relevantes poderão ser comunicadas pelos canais disponíveis. Dúvidas podem ser enviadas para contato@gamerbiz.com.br.",
          ],
        },
      ],
    },
  },
  en: {
    navigationLabel: "Legal documents",
    privacyLabel: "Privacy Policy",
    termsLabel: "Terms of Service",
    backHome: "Back to home",
    privacy: {
      eyebrow: "GAMERBIZ · PRIVACY",
      title: "Privacy Policy",
      description:
        "Learn how Gamerbiz collects, uses, shares, and protects personal data across its website, portals, and Media Kits.",
      effectiveDateLabel: "Effective from",
      effectiveDate: "August 13, 2026",
      sections: [
        {
          title: "1. Who controls your data",
          paragraphs: [
            `${COMPANY.en} is the controller of personal data processed through Gamerbiz services. Privacy requests may be sent to contato@gamerbiz.com.br.`,
          ],
        },
        {
          title: "2. Data we may collect",
          paragraphs: [
            "We collect only the data needed to operate the website, handle commercial enquiries, manage Media Kits, and allow creators to connect social accounts.",
          ],
          items: [
            "Registration and contact data, such as name, email, telephone number, company, and role.",
            "Authentication and administration data, such as account identifier, access role, and login records. Passwords are handled by the authentication provider and are not displayed to Gamerbiz.",
            "Creator professional and public data, such as stage name, biography, image, city, category, and profile links.",
            "Authorized social metrics, such as followers, views, likes, comments, shares, and audience data made available by official APIs.",
            "Technical data, such as IP address, browser, device, accessed pages, date and time, errors, and security logs.",
            "Information voluntarily submitted through forms, proposals, applications, or messages.",
          ],
        },
        {
          title: "3. How we use data",
          paragraphs: ["We may process personal data to:"],
          items: [
            "Provide, authenticate, secure, and maintain the website, administrative dashboard, and creator portal.",
            "Create, publish, and update Media Kits and authorized metrics.",
            "Respond to enquiries, review applications, and prepare proposals or campaigns.",
            "Perform contracts, comply with legal obligations, and establish or defend legal claims.",
            "Prevent fraud, abuse, incidents, and unauthorized access.",
            "Improve service performance, accessibility, and experience using aggregated or strictly necessary data.",
          ],
        },
        {
          title: "4. Legal grounds",
          paragraphs: [
            "Under the Brazilian LGPD, we rely on the appropriate legal basis for each activity, including contract performance or preliminary procedures, compliance with legal obligations, legitimate interests balanced against data-subject rights, establishment or defense of claims, and consent where required. Consent may be withdrawn without affecting prior lawful processing.",
          ],
        },
        {
          title: "5. Social media integrations",
          paragraphs: [
            "When connecting YouTube, TikTok, or another platform, the creator is redirected to that platform's official authorization flow and sees the requested scopes. Gamerbiz receives authorized access tokens and data, not the social account password.",
            "Tokens are used to synchronize Media Kit metrics and may be refreshed while the connection remains active. The creator may revoke access in the platform settings or request disconnection. Revocation may stop future updates but does not require deletion where retention is legally required or needed to establish or defend claims.",
          ],
        },
        {
          title: "6. Sharing and processors",
          paragraphs: [
            "We may share data with providers supporting hosting, databases, authentication, security, communications, storage, and social APIs, only as needed to provide the service. These may currently include Supabase, hosting providers, and platforms connected by the user.",
            "We may also disclose information when required by law, competent authority, protection of rights, or a legitimate corporate transaction. We do not sell personal data.",
          ],
        },
        {
          title: "7. International transfers",
          paragraphs: [
            "Some providers and social platforms may process data outside Brazil. Where applicable, we use mechanisms compatible with the LGPD and appropriate contractual and security safeguards.",
          ],
        },
        {
          title: "8. Retention and deletion",
          paragraphs: [
            "We retain data for as long as needed for the stated purposes, the relationship, legal obligations, fraud prevention, and legal claims. When no longer needed, data is deleted, anonymized, or securely retained where permitted by law.",
          ],
        },
        {
          title: "9. Security",
          paragraphs: [
            "We apply technical and organizational controls proportionate to risk, including access control, authentication, security logs, and credential protection. No system is entirely immune; for relevant incidents, we will take the legally and technically appropriate measures.",
          ],
        },
        {
          title: "10. Your rights",
          paragraphs: [
            "Under the LGPD, you may request confirmation and access, correction, anonymization, blocking or deletion where applicable, portability subject to regulation, information about sharing, review of automated decisions, objection, and withdrawal of consent.",
            "Send requests to contato@gamerbiz.com.br. We may ask for information to verify your identity and prevent unauthorized access. You may also petition Brazil's National Data Protection Authority (ANPD).",
          ],
        },
        {
          title: "11. Cookies and local storage",
          paragraphs: [
            "We use strictly necessary resources, such as local storage for language preference and session/authentication components. If optional analytics or advertising tools are introduced, this policy and choice mechanisms will be updated where required.",
          ],
        },
        {
          title: "12. Children and teenagers",
          paragraphs: [
            "Management portals are not intended for children. Processing minors' data in campaigns or Media Kits must observe their best interests, appropriate authorizations, and other applicable legal requirements.",
          ],
        },
        {
          title: "13. Changes and contact",
          paragraphs: [
            "We may update this policy to reflect legal, technical, or operational changes. The current version and date will always be available here. Questions or requests may be sent to contato@gamerbiz.com.br.",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "GAMERBIZ · TERMS",
      title: "Terms of Service",
      description:
        "Rules governing access to and use of the Gamerbiz website, portals, Media Kits, and integrations.",
      effectiveDateLabel: "Effective from",
      effectiveDate: "August 13, 2026",
      sections: [
        {
          title: "1. Acceptance and provider",
          paragraphs: [
            `These Terms govern the digital services offered by ${COMPANY.en}. By accessing or using the services, you acknowledge that you have read and agree to these Terms and the Privacy Policy.`,
          ],
        },
        {
          title: "2. Services",
          paragraphs: [
            "Gamerbiz provides institutional content, contact channels, public Media Kits, and authenticated areas for administration and authorized creator-account connections. Features may vary, be updated, or be discontinued according to operational and contractual needs.",
          ],
        },
        {
          title: "3. Accounts and access",
          paragraphs: [
            "Accounts are created or authorized by Gamerbiz for people connected to its operations. You must provide accurate information, keep credentials confidential, change temporary passwords, and immediately report suspected unauthorized access.",
            "Each creator may access only the Media Kits and features associated with their authorization. Administrators have expanded permissions according to their role. Account sharing, bypassing controls, or accessing third-party data without authorization is prohibited.",
          ],
        },
        {
          title: "4. Social connections and data",
          paragraphs: [
            "By connecting a social account, you confirm that you are authorized to manage it and permit Gamerbiz to retrieve and update the metrics covered by the displayed OAuth scopes. Availability and accuracy depend on third-party APIs and policies.",
            "You may revoke the connection through the relevant platform. Revocation stops future synchronization and may limit Media Kit functionality.",
          ],
        },
        {
          title: "5. Content and permissions",
          paragraphs: [
            "You remain responsible for information, images, names, marks, links, and other submitted materials. By providing them for a Media Kit or campaign, you grant Gamerbiz a non-exclusive permission to host, technically adapt, display, and distribute them as needed to provide the services and perform the commercial relationship.",
            "You confirm that you hold the necessary rights and authorizations and must promptly report inaccurate or outdated content or content that should no longer be published.",
          ],
        },
        {
          title: "6. Permitted use",
          paragraphs: ["You may not:"],
          items: [
            "Use the services for illegal, fraudulent, abusive, discriminatory activities or to infringe third-party rights.",
            "Attempt unauthorized intrusion or vulnerability testing, interfere with security, or distribute malicious code.",
            "Systematically copy, extract, or exploit data and content beyond granted permissions.",
            "Impersonate others, falsify metrics, or provide misleading information.",
            "Remove proprietary notices or use Gamerbiz marks without permission.",
          ],
        },
        {
          title: "7. Intellectual property",
          paragraphs: [
            "The website, visual identity, software, structure, copy, and proprietary materials are protected by intellectual-property laws and belong to Gamerbiz or its licensors. These Terms transfer no ownership and grant no license beyond normal service use.",
          ],
        },
        {
          title: "8. Third-party services",
          paragraphs: [
            "Third-party links, APIs, and integrations, including YouTube, TikTok, and infrastructure providers, are subject to their own terms and policies. Gamerbiz does not control their outages, API changes, suspensions, or decisions.",
          ],
        },
        {
          title: "9. Availability and changes",
          paragraphs: [
            "We seek to keep services secure and available but do not guarantee uninterrupted or error-free operation. We may perform maintenance, correct faults, change features, and suspend access for security, legal obligations, breach of these Terms, or the end of the applicable relationship.",
          ],
        },
        {
          title: "10. Liability",
          paragraphs: [
            "To the extent permitted by law, Gamerbiz is not liable for damage arising from misuse, user-caused credential compromise, third-party content or services, inaccurate platform data, external outages, or events outside its reasonable control.",
            "Nothing in these Terms excludes liability that cannot legally be excluded, including mandatory consumer rights where applicable.",
          ],
        },
        {
          title: "11. Termination",
          paragraphs: [
            "You may stop using the services and request account closure through Gamerbiz channels. We may restrict or terminate access for breach, security risk, legal obligation, or the end of the relationship, retaining data and rights as described in the Privacy Policy and applicable law.",
          ],
        },
        {
          title: "12. Governing law and venue",
          paragraphs: [
            "These Terms are governed by the laws of the Federative Republic of Brazil. The courts of São Paulo/SP shall have jurisdiction, without prejudice to any venue mandatorily available to consumers.",
          ],
        },
        {
          title: "13. Changes and contact",
          paragraphs: [
            "We may update these Terms. The current version and date will be available here, and material changes may be communicated through available channels. Questions may be sent to contato@gamerbiz.com.br.",
          ],
        },
      ],
    },
  },
  es: {
    navigationLabel: "Documentos legales",
    privacyLabel: "Política de privacidad",
    termsLabel: "Términos de servicio",
    backHome: "Volver al inicio",
    privacy: {
      eyebrow: "GAMERBIZ · PRIVACIDAD",
      title: "Política de Privacidad",
      description:
        "Conozca cómo Gamerbiz recopila, utiliza, comparte y protege datos personales en su sitio, portales y Media Kits.",
      effectiveDateLabel: "Vigente desde",
      effectiveDate: "13 de agosto de 2026",
      sections: [
        {
          title: "1. Quién controla sus datos",
          paragraphs: [
            `${COMPANY.es} es la responsable del tratamiento de los datos personales en los servicios Gamerbiz. Las solicitudes de privacidad pueden enviarse a contato@gamerbiz.com.br.`,
          ],
        },
        {
          title: "2. Datos que podemos recopilar",
          paragraphs: [
            "Recopilamos únicamente los datos necesarios para operar el sitio, responder contactos comerciales, administrar Media Kits y permitir que los creadores conecten sus redes sociales.",
          ],
          items: [
            "Datos de registro y contacto, como nombre, correo, teléfono, empresa y cargo.",
            "Datos de autenticación y administración, como identificador de cuenta, función de acceso y registros de inicio de sesión. Las contraseñas son procesadas por el proveedor de autenticación y no se muestran a Gamerbiz.",
            "Datos profesionales y públicos de creadores, como nombre artístico, biografía, imagen, ciudad, categoría y enlaces de perfiles.",
            "Métricas sociales autorizadas, como seguidores, visualizaciones, me gusta, comentarios, compartidos y datos de audiencia disponibles mediante APIs oficiales.",
            "Datos técnicos, como dirección IP, navegador, dispositivo, páginas visitadas, fecha y hora, fallos y registros de seguridad.",
            "Información enviada voluntariamente mediante formularios, propuestas, solicitudes o mensajes.",
          ],
        },
        {
          title: "3. Cómo usamos los datos",
          paragraphs: ["Podemos tratar datos para:"],
          items: [
            "Proporcionar, autenticar, proteger y mantener el sitio, el panel administrativo y el portal del creador.",
            "Crear, publicar y actualizar Media Kits y métricas autorizadas.",
            "Responder consultas, evaluar solicitudes y preparar propuestas o campañas.",
            "Cumplir contratos y obligaciones legales y ejercer derechos.",
            "Prevenir fraude, abuso, incidentes y accesos no autorizados.",
            "Mejorar el rendimiento, la accesibilidad y la experiencia con datos agregados o estrictamente necesarios.",
          ],
        },
        {
          title: "4. Bases legales",
          paragraphs: [
            "De acuerdo con la LGPD brasileña, utilizamos la base legal adecuada a cada actividad, incluida la ejecución contractual, el cumplimiento de obligaciones legales, el interés legítimo ponderado con los derechos del titular, el ejercicio de derechos y el consentimiento cuando corresponda. El consentimiento puede revocarse sin afectar tratamientos previos legítimos.",
          ],
        },
        {
          title: "5. Integraciones con redes sociales",
          paragraphs: [
            "Al conectar YouTube, TikTok u otra plataforma, el creador es dirigido al flujo oficial de autorización y visualiza los permisos solicitados. Gamerbiz recibe tokens y datos autorizados, no la contraseña de la red social.",
            "Los tokens sincronizan las métricas y pueden renovarse mientras la conexión esté activa. El creador puede revocar el acceso en la plataforma o solicitar la desconexión. La revocación detiene futuras actualizaciones, sin perjuicio de retenciones legalmente necesarias.",
          ],
        },
        {
          title: "6. Compartición y proveedores",
          paragraphs: [
            "Podemos compartir datos con proveedores de alojamiento, base de datos, autenticación, seguridad, comunicación, almacenamiento y APIs sociales, solo en la medida necesaria. Actualmente pueden incluir Supabase, proveedores de alojamiento y las plataformas conectadas por el usuario.",
            "También podemos compartir información por obligación legal, autoridad competente, protección de derechos u operación societaria legítima. No vendemos datos personales.",
          ],
        },
        {
          title: "7. Transferencias internacionales",
          paragraphs: [
            "Algunos proveedores y plataformas pueden procesar datos fuera de Brasil. Cuando corresponda, aplicamos mecanismos compatibles con la LGPD y salvaguardas contractuales y de seguridad adecuadas.",
          ],
        },
        {
          title: "8. Conservación y eliminación",
          paragraphs: [
            "Conservamos los datos durante el tiempo necesario para las finalidades informadas, la relación, las obligaciones legales, la prevención de fraude y el ejercicio de derechos. Después, se eliminan, anonimizan o conservan de forma segura cuando la ley lo permita.",
          ],
        },
        {
          title: "9. Seguridad",
          paragraphs: [
            "Aplicamos controles técnicos y organizativos proporcionales al riesgo, incluidos control de acceso, autenticación, registros de seguridad y protección de credenciales. Ningún sistema es totalmente inmune; ante incidentes relevantes, adoptaremos las medidas legales y técnicas correspondientes.",
          ],
        },
        {
          title: "10. Sus derechos",
          paragraphs: [
            "Según la LGPD, puede solicitar confirmación y acceso, corrección, anonimización, bloqueo o eliminación cuando corresponda, portabilidad conforme a regulación, información sobre comparticiones, revisión de decisiones automatizadas, oposición y revocación del consentimiento.",
            "Envíe solicitudes a contato@gamerbiz.com.br. Podemos pedir información para verificar su identidad. También puede presentar una petición ante la Autoridad Nacional de Protección de Datos de Brasil (ANPD).",
          ],
        },
        {
          title: "11. Cookies y almacenamiento local",
          paragraphs: [
            "Utilizamos recursos estrictamente necesarios, como almacenamiento local de la preferencia de idioma y elementos de sesión/autenticación. Si se añaden herramientas opcionales de análisis o publicidad, actualizaremos esta política y los mecanismos de elección cuando sea necesario.",
          ],
        },
        {
          title: "12. Niños y adolescentes",
          paragraphs: [
            "Los portales de gestión no están destinados a niños. El tratamiento de datos de menores en campañas o Media Kits debe respetar su interés superior, las autorizaciones y los demás requisitos legales aplicables.",
          ],
        },
        {
          title: "13. Cambios y contacto",
          paragraphs: [
            "Podemos actualizar esta política por cambios legales, técnicos u operativos. La versión vigente y su fecha estarán siempre aquí. Envíe dudas o solicitudes a contato@gamerbiz.com.br.",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "GAMERBIZ · TÉRMINOS",
      title: "Términos de Servicio",
      description:
        "Reglas de acceso y uso del sitio, portales, Media Kits e integraciones de Gamerbiz.",
      effectiveDateLabel: "Vigente desde",
      effectiveDate: "13 de agosto de 2026",
      sections: [
        {
          title: "1. Aceptación y proveedor",
          paragraphs: [
            `Estos Términos regulan los servicios digitales ofrecidos por ${COMPANY.es}. Al acceder o utilizar los servicios, declara haber leído y aceptado estos Términos y la Política de Privacidad.`,
          ],
        },
        {
          title: "2. Servicios",
          paragraphs: [
            "Gamerbiz proporciona contenido institucional, canales de contacto, Media Kits públicos y áreas autenticadas para administración y conexión autorizada de cuentas de creadores. Las funciones pueden variar, actualizarse o interrumpirse según necesidades operativas y contractuales.",
          ],
        },
        {
          title: "3. Cuentas y acceso",
          paragraphs: [
            "Las cuentas son creadas o autorizadas por Gamerbiz para personas vinculadas a sus operaciones. Debe proporcionar información correcta, mantener sus credenciales confidenciales, cambiar contraseñas temporales e informar inmediatamente cualquier acceso sospechoso.",
            "Cada creador solo puede acceder a los Media Kits y recursos asociados a su autorización. Los administradores tienen permisos ampliados según su función. Se prohíbe compartir cuentas, eludir controles o acceder sin autorización a datos de terceros.",
          ],
        },
        {
          title: "4. Conexiones y datos sociales",
          paragraphs: [
            "Al conectar una red social, confirma que está autorizado sobre la cuenta y permite que Gamerbiz consulte y actualice las métricas incluidas en los permisos OAuth mostrados. La disponibilidad y precisión dependen de APIs y políticas de terceros.",
            "Puede revocar la conexión en la plataforma correspondiente. La revocación detiene futuras sincronizaciones y puede limitar el Media Kit.",
          ],
        },
        {
          title: "5. Contenido y autorizaciones",
          paragraphs: [
            "Usted sigue siendo responsable de la información, imágenes, nombres, marcas, enlaces y otros materiales proporcionados. Al facilitarlos para un Media Kit o campaña, concede a Gamerbiz permiso no exclusivo para alojarlos, adaptarlos técnicamente, mostrarlos y distribuirlos en la medida necesaria para prestar los servicios y ejecutar la relación comercial.",
            "Declara poseer los derechos necesarios y debe comunicar inmediatamente contenidos incorrectos, desactualizados o cuya publicación deba cesar.",
          ],
        },
        {
          title: "6. Uso permitido",
          paragraphs: ["No puede:"],
          items: [
            "Utilizar los servicios para actividades ilegales, fraudulentas, abusivas o discriminatorias, ni vulnerar derechos de terceros.",
            "Intentar intrusiones o pruebas de vulnerabilidad no autorizadas, interferir con la seguridad o distribuir código malicioso.",
            "Copiar, extraer o explotar sistemáticamente datos y contenidos fuera de los permisos concedidos.",
            "Suplantar a terceros, falsificar métricas o proporcionar información engañosa.",
            "Eliminar avisos de propiedad o usar las marcas de Gamerbiz sin permiso.",
          ],
        },
        {
          title: "7. Propiedad intelectual",
          paragraphs: [
            "El sitio, identidad visual, software, estructura, textos y materiales propios están protegidos por leyes de propiedad intelectual y pertenecen a Gamerbiz o sus licenciantes. Estos Términos no transfieren propiedad ni conceden licencias más allá del uso normal.",
          ],
        },
        {
          title: "8. Servicios de terceros",
          paragraphs: [
            "Los enlaces, APIs e integraciones de terceros, incluidos YouTube, TikTok y proveedores de infraestructura, se rigen por sus propios términos y políticas. Gamerbiz no controla sus interrupciones, cambios de API, suspensiones o decisiones.",
          ],
        },
        {
          title: "9. Disponibilidad y cambios",
          paragraphs: [
            "Buscamos mantener los servicios seguros y disponibles, pero no garantizamos un funcionamiento ininterrumpido o sin errores. Podemos realizar mantenimiento, corregir fallos, modificar funciones y suspender accesos por seguridad, obligación legal, incumplimiento o finalización de la relación.",
          ],
        },
        {
          title: "10. Responsabilidad",
          paragraphs: [
            "En la medida permitida por ley, Gamerbiz no responde por daños derivados del uso indebido, credenciales comprometidas por culpa del usuario, contenido o servicios de terceros, datos inexactos de plataformas, indisponibilidad externa o eventos fuera de su control razonable.",
            "Nada excluye responsabilidades que legalmente no puedan excluirse, incluidos los derechos obligatorios de los consumidores cuando sean aplicables.",
          ],
        },
        {
          title: "11. Terminación",
          paragraphs: [
            "Puede dejar de usar los servicios y solicitar el cierre de su cuenta. Gamerbiz puede restringir o terminar el acceso por incumplimiento, riesgo de seguridad, obligación legal o fin de la relación, conservando datos y derechos conforme a la Política de Privacidad y la ley.",
          ],
        },
        {
          title: "12. Ley y jurisdicción",
          paragraphs: [
            "Estos Términos se rigen por las leyes de la República Federativa de Brasil. Se elige el fuero de São Paulo/SP, sin perjuicio del fuero legalmente garantizado al consumidor cuando corresponda.",
          ],
        },
        {
          title: "13. Cambios y contacto",
          paragraphs: [
            "Podemos actualizar estos Términos. La versión vigente y su fecha estarán aquí; los cambios relevantes podrán comunicarse por los canales disponibles. Envíe dudas a contato@gamerbiz.com.br.",
          ],
        },
      ],
    },
  },
  "zh-CN": {
    navigationLabel: "法律文件",
    privacyLabel: "隐私政策",
    termsLabel: "服务条款",
    backHome: "返回首页",
    privacy: {
      eyebrow: "GAMERBIZ · 隐私",
      title: "隐私政策",
      description:
        "了解 Gamerbiz 如何在其网站、门户和 Media Kit 中收集、使用、共享和保护个人数据。",
      effectiveDateLabel: "生效日期",
      effectiveDate: "2026年8月13日",
      sections: [
        {
          title: "1. 数据控制者",
          paragraphs: [
            `${COMPANY.zh}是 Gamerbiz 服务中个人数据的控制者。隐私请求可发送至 contato@gamerbiz.com.br。`,
          ],
        },
        {
          title: "2. 我们可能收集的数据",
          paragraphs: [
            "我们仅收集运营网站、处理商业咨询、管理 Media Kit 以及允许创作者连接社交账户所必需的数据。",
          ],
          items: [
            "注册和联系信息，例如姓名、电子邮件、电话号码、公司和职位。",
            "身份验证和管理数据，例如账户标识符、访问角色和登录记录。密码由身份验证服务商处理，不会向 Gamerbiz 显示。",
            "创作者的职业和公开信息，例如艺名、简介、图片、城市、类别和个人资料链接。",
            "经授权的社交指标，例如关注者、观看次数、点赞、评论、分享以及官方 API 提供的受众数据。",
            "技术数据，例如 IP 地址、浏览器、设备、访问页面、日期时间、错误和安全日志。",
            "通过表单、提案、申请或消息自愿提交的信息。",
          ],
        },
        {
          title: "3. 数据用途",
          paragraphs: ["我们可能为以下目的处理个人数据："],
          items: [
            "提供、验证、保护和维护网站、管理面板及创作者门户。",
            "创建、发布和更新 Media Kit 及获授权的指标。",
            "回复咨询、评估申请并制定提案或活动。",
            "履行合同和法律义务以及提出或维护法律权利。",
            "防止欺诈、滥用、安全事件和未经授权的访问。",
            "通过汇总数据或严格必要的数据改善性能、无障碍和用户体验。",
          ],
        },
        {
          title: "4. 法律依据",
          paragraphs: [
            "根据巴西《通用数据保护法》（LGPD），我们为每项活动采用适当的法律依据，包括履行合同或合同前程序、履行法律义务、在平衡数据主体权利后基于合法利益、提出或维护权利，以及在需要时取得同意。同意可被撤回，但不影响此前的合法处理。",
          ],
        },
        {
          title: "5. 社交媒体集成",
          paragraphs: [
            "连接 YouTube、TikTok 或其他平台时，创作者会进入该平台的官方授权流程并查看请求的权限。Gamerbiz 接收经授权的访问令牌和数据，而不会收到社交账户密码。",
            "令牌用于同步 Media Kit 指标，并可在连接有效期间刷新。创作者可在平台设置中撤销授权或要求 Gamerbiz 断开连接。撤销会停止后续更新，但法律要求或维护权利所需的数据可继续保留。",
          ],
        },
        {
          title: "6. 共享与处理服务商",
          paragraphs: [
            "我们可能仅在提供服务所需范围内，与支持托管、数据库、身份验证、安全、通信、存储和社交 API 的服务商共享数据。目前可能包括 Supabase、托管服务商以及用户主动连接的平台。",
            "法律要求、主管机关要求、保护权利或合法企业交易时，我们也可能披露信息。我们不出售个人数据。",
          ],
        },
        {
          title: "7. 跨境传输",
          paragraphs: [
            "部分服务商和社交平台可能在巴西境外处理数据。适用时，我们会采用符合 LGPD 的机制以及适当的合同和安全保障。",
          ],
        },
        {
          title: "8. 保存与删除",
          paragraphs: [
            "我们会在实现所述目的、维持关系、履行法律义务、防止欺诈及维护权利所需期限内保存数据。此后，数据将被删除、匿名化，或在法律允许时安全保留。",
          ],
        },
        {
          title: "9. 安全",
          paragraphs: [
            "我们根据风险采取技术和组织控制，包括访问控制、身份验证、安全日志和凭证保护。任何系统都无法完全免受风险；发生重大事件时，我们将采取适当的法律和技术措施。",
          ],
        },
        {
          title: "10. 您的权利",
          paragraphs: [
            "根据 LGPD，您可在适用情况下请求确认和访问、更正、匿名化、阻止或删除、依规定进行可携带、了解共享情况、复核自动化决定、提出异议及撤回同意。",
            "请将请求发送至 contato@gamerbiz.com.br。为保护数据，我们可能要求验证身份。您也可以向巴西国家数据保护局（ANPD）提出申请。",
          ],
        },
        {
          title: "11. Cookie 与本地存储",
          paragraphs: [
            "我们使用严格必要的技术，例如保存语言偏好的本地存储以及会话/身份验证组件。如果以后加入可选分析或广告工具，我们将在需要时更新本政策和选择机制。",
          ],
        },
        {
          title: "12. 儿童与青少年",
          paragraphs: [
            "管理门户不面向儿童。在活动或 Media Kit 中处理未成年人数据时，必须遵守其最佳利益、必要授权以及其他适用法律要求。",
          ],
        },
        {
          title: "13. 更新与联系",
          paragraphs: [
            "我们可能因法律、技术或运营变化更新本政策。当前版本和日期将始终发布于此。问题或请求可发送至 contato@gamerbiz.com.br。",
          ],
        },
      ],
    },
    terms: {
      eyebrow: "GAMERBIZ · 条款",
      title: "服务条款",
      description: "适用于访问和使用 Gamerbiz 网站、门户、Media Kit 及集成功能的规则。",
      effectiveDateLabel: "生效日期",
      effectiveDate: "2026年8月13日",
      sections: [
        {
          title: "1. 接受条款与服务提供者",
          paragraphs: [
            `本条款规范${COMPANY.zh}提供的数字服务。访问或使用服务即表示您已阅读并同意本条款和隐私政策。`,
          ],
        },
        {
          title: "2. 服务",
          paragraphs: [
            "Gamerbiz 提供机构信息、联系渠道、公开 Media Kit，以及用于管理和授权连接创作者账户的认证区域。功能可根据运营和合同需要进行调整、更新或停止。",
          ],
        },
        {
          title: "3. 账户与访问",
          paragraphs: [
            "账户由 Gamerbiz 为与其业务相关的人员创建或授权。您必须提供准确信息、对凭证保密、更改临时密码，并立即报告疑似未经授权的访问。",
            "每位创作者只能访问与其授权相关的 Media Kit 和功能。管理员根据职责拥有扩展权限。禁止共享账户、绕过控制或未经授权访问第三方数据。",
          ],
        },
        {
          title: "4. 社交连接与数据",
          paragraphs: [
            "连接社交账户即表示您有权管理该账户，并允许 Gamerbiz 根据显示的 OAuth 权限获取和更新指标。可用性和准确性取决于第三方 API 和政策。",
            "您可在相应平台撤销连接。撤销将停止后续同步，并可能限制 Media Kit 功能。",
          ],
        },
        {
          title: "5. 内容与授权",
          paragraphs: [
            "您仍对所提供的信息、图片、名称、商标、链接及其他材料负责。将其用于 Media Kit 或活动时，您授予 Gamerbiz 非独占许可，以在提供服务和履行商业关系所需范围内托管、进行技术适配、展示和分发这些材料。",
            "您确认拥有必要权利和授权，并应及时告知不准确、过时或应停止发布的内容。",
          ],
        },
        {
          title: "6. 允许的使用",
          paragraphs: ["您不得："],
          items: [
            "将服务用于违法、欺诈、滥用、歧视活动或侵犯第三方权利。",
            "进行未经授权的入侵或漏洞测试、干扰安全措施或传播恶意代码。",
            "超出授权范围系统性复制、提取或利用数据和内容。",
            "冒充他人、伪造指标或提供误导性信息。",
            "删除所有权声明或未经许可使用 Gamerbiz 商标。",
          ],
        },
        {
          title: "7. 知识产权",
          paragraphs: [
            "网站、视觉识别、软件、结构、文本和自有材料受知识产权法保护，归 Gamerbiz 或其许可方所有。本条款不转让所有权，也不授予正常使用服务范围之外的许可。",
          ],
        },
        {
          title: "8. 第三方服务",
          paragraphs: [
            "第三方链接、API 和集成（包括 YouTube、TikTok 及基础设施服务商）受其自身条款和政策约束。Gamerbiz 无法控制其停机、API 变化、暂停或其他决定。",
          ],
        },
        {
          title: "9. 可用性与变更",
          paragraphs: [
            "我们努力保持服务安全可用，但不保证不间断或无错误运行。我们可能进行维护、修复问题、调整功能，并因安全、法律义务、违反本条款或相关关系终止而暂停访问。",
          ],
        },
        {
          title: "10. 责任",
          paragraphs: [
            "在法律允许范围内，对于误用、因用户原因导致的凭证泄露、第三方内容或服务、平台提供的不准确数据、外部停机或超出合理控制范围的事件所造成的损失，Gamerbiz 不承担责任。",
            "本条款不排除法律不允许排除的责任，包括适用时的强制性消费者权利。",
          ],
        },
        {
          title: "11. 终止",
          paragraphs: [
            "您可停止使用服务并通过 Gamerbiz 渠道申请关闭账户。因违规、安全风险、法律义务或关系终止，我们可限制或终止访问，并按照隐私政策和法律保留必要数据及权利。",
          ],
        },
        {
          title: "12. 适用法律与管辖",
          paragraphs: [
            "本条款受巴西联邦共和国法律管辖。争议由 São Paulo/SP 法院管辖，但不影响法律强制保障消费者选择的管辖地。",
          ],
        },
        {
          title: "13. 更新与联系",
          paragraphs: [
            "我们可能更新本条款。当前版本和日期将发布于此，重大变更可通过可用渠道通知。问题请发送至 contato@gamerbiz.com.br。",
          ],
        },
      ],
    },
  },
};
