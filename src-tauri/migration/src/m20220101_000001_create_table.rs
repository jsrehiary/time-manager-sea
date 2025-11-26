use sea_orm_migration::{prelude::*, schema::*};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create boards table
        manager
            .create_table(
                Table::create()
                    .table(Board::Table)
                    .if_not_exists()
                    .col(pk_auto(Board::Id))
                    .col(string(Board::Name))
                    .col(string_null(Board::Description))
                    .col(timestamp_with_time_zone(Board::CreatedAt))
                    .col(timestamp_with_time_zone(Board::UpdatedAt))
                    .to_owned(),
            )
            .await?;

        // Create columns table
        manager
            .create_table(
                Table::create()
                    .table(Column::Table)
                    .if_not_exists()
                    .col(pk_auto(Column::Id))
                    .col(integer(Column::BoardId))
                    .col(string(Column::Name))
                    .col(integer(Column::Position))
                    .col(timestamp_with_time_zone(Column::CreatedAt))
                    .col(timestamp_with_time_zone(Column::UpdatedAt))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_column_board")
                            .from(Column::Table, Column::BoardId)
                            .to(Board::Table, Board::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        // Create tasks table
        manager
            .create_table(
                Table::create()
                    .table(Task::Table)
                    .if_not_exists()
                    .col(pk_auto(Task::Id))
                    .col(integer(Task::ColumnId))
                    .col(string(Task::Title))
                    .col(text_null(Task::Description))
                    .col(integer(Task::Position))
                    .col(string_null(Task::Priority))
                    .col(timestamp_with_time_zone_null(Task::DueDate))
                    .col(timestamp_with_time_zone(Task::CreatedAt))
                    .col(timestamp_with_time_zone(Task::UpdatedAt))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_task_column")
                            .from(Task::Table, Task::ColumnId)
                            .to(Column::Table, Column::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Drop tables in reverse order due to foreign key constraints
        manager
            .drop_table(Table::drop().table(Task::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Column::Table).to_owned())
            .await?;

        manager
            .drop_table(Table::drop().table(Board::Table).to_owned())
            .await?;

        Ok(())
    }
}

#[derive(DeriveIden)]
enum Board {
    Table,
    Id,
    Name,
    Description,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Column {
    Table,
    Id,
    BoardId,
    Name,
    Position,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Task {
    Table,
    Id,
    ColumnId,
    Title,
    Description,
    Position,
    Priority,
    DueDate,
    CreatedAt,
    UpdatedAt,
}
