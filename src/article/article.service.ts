import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticleDto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from './dto/updateArticleDto';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ) {
    const article = new ArticleEntity();

    Object.assign(article, createArticleDto);
    if (!article.tagList) article.tagList = [];

    article.author = currentUser;
    article.slug = this.getSlug(createArticleDto.title);

    return await this.articleRepository.save(article);
  }

  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }
    if (query.author) {
      const author = await this.userRepository.findOne({
        username: query.author,
      });
      queryBuilder.andWhere('articles.authorId = :id', { id: author?.id });
    }
    if (query.limit) queryBuilder.limit(query.limit);
    if (query.offset) queryBuilder.offset(query.offset);

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }

  async updateArticle(
    slug: string,
    updateArticleDto: UpdateArticleDto,
    userId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException("Article does't exist", HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== userId) {
      throw new HttpException("Article does't exist", HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArticleDto);

    return article;
  }

  async deleteArticle(slug: string, userId: number): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException("Article does't exist", HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== userId) {
      throw new HttpException("Article does't exist", HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete({ slug });
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ slug });
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
